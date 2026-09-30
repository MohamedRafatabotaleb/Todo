#!/usr/bin/env python3
"""Remove background music and cut silent parts from a video.

Pipeline:
  1. Extract the audio track from the input video.
  2. Separate vocals from music with the UVR MDX-Net vocal model (audio-separator).
  3. Detect silent ranges in the clean vocals with ffmpeg's silencedetect.
  4. Keep only the non-silent ranges and re-encode video + clean vocals.

Requirements: ffmpeg/ffprobe on PATH, `pip install "audio-separator[cpu]"`.
"""

import argparse
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def run(cmd):
    """Run a command, fail loudly, and return its combined stderr text."""
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if result.returncode != 0:
        sys.exit(f"Command failed: {' '.join(map(str, cmd))}\n{result.stderr[-2000:]}")
    return result.stderr


def get_duration(path):
    """Return the media duration in seconds using ffprobe."""
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", str(path)], text=True)
    return float(out.strip())


def extract_audio(video, wav):
    """Extract the video's audio as 44.1 kHz stereo WAV (the separator's native rate)."""
    run(["ffmpeg", "-y", "-i", str(video), "-vn", "-ac", "2", "-ar", "44100", str(wav)])


def separate_vocals(wav, work_dir, model, model_dir):
    """Extract only the vocals stem with audio-separator and return its path."""
    out_dir = work_dir / "stems"
    run(["audio-separator", str(wav), "-m", model, "--model_file_dir", str(model_dir),
         "--output_dir", str(out_dir), "--single_stem", "Vocals", "--output_format", "WAV"])
    return next(out_dir.glob("*Vocals*.wav"))


def detect_silences(wav, noise_db, min_silence):
    """Return a list of (start, end) silent ranges found by ffmpeg silencedetect."""
    log = run(["ffmpeg", "-i", str(wav), "-af",
               f"silencedetect=noise={noise_db}dB:d={min_silence}", "-f", "null", "-"])
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    # A trailing silence has a start but no end; close it at "infinity".
    ends += [float("inf")] * (len(starts) - len(ends))
    return list(zip(starts, ends))


def build_keep_segments(silences, duration, padding, min_keep):
    """Invert silent ranges into speech ranges, padded so words are not clipped."""
    segments, cursor = [], 0.0
    for s_start, s_end in silences:
        # Speech runs from the cursor to the silence start (plus padding).
        seg_end = min(s_start + padding, duration)
        if seg_end - cursor >= min_keep:
            segments.append((cursor, seg_end))
        # Next speech starts at the silence end (minus padding).
        cursor = max(min(s_end, duration) - padding, 0.0)
    if duration - cursor >= min_keep:
        segments.append((cursor, duration))
    # Merge overlapping segments produced by padding.
    merged = []
    for start, end in segments:
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged


def render(video, vocals, segments, output, work_dir, crf):
    """Trim video + clean vocals to the kept segments and concatenate them."""
    parts = []
    for i, (start, end) in enumerate(segments):
        parts.append(
            f"[0:v]trim=start={start:.3f}:end={end:.3f},setpts=PTS-STARTPTS[v{i}];"
            f"[1:a]atrim=start={start:.3f}:end={end:.3f},asetpts=PTS-STARTPTS,"
            # Tiny fades avoid clicks at every cut point.
            f"afade=t=in:d=0.02,afade=t=out:st={max(end - start - 0.02, 0):.3f}:d=0.02[a{i}];"
        )
    inputs = "".join(f"[v{i}][a{i}]" for i in range(len(segments)))
    graph = "".join(parts) + f"{inputs}concat=n={len(segments)}:v=1:a=1[outv][outa]"
    # Write the filter graph to a file because it can exceed the command-line limit.
    graph_file = work_dir / "filter.txt"
    graph_file.write_text(graph)
    run(["ffmpeg", "-y", "-i", str(video), "-i", str(vocals),
         "-filter_complex_script", str(graph_file), "-map", "[outv]", "-map", "[outa]",
         "-c:v", "libx264", "-preset", "medium", "-crf", str(crf),
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(output)])


def main():
    """Parse CLI arguments and run the full clean-up pipeline."""
    p = argparse.ArgumentParser(description="Remove music and silence from a video.")
    p.add_argument("input", type=Path, help="Input video file")
    p.add_argument("-o", "--output", type=Path, help="Output video (default: <input>_clean.mp4)")
    p.add_argument("--noise-db", type=float, default=-35, help="Silence threshold in dB")
    p.add_argument("--min-silence", type=float, default=0.5, help="Minimum silence length to cut (s)")
    p.add_argument("--padding", type=float, default=0.15, help="Audio kept around each cut (s)")
    p.add_argument("--min-keep", type=float, default=0.2, help="Drop speech blips shorter than this (s)")
    p.add_argument("--model", default="UVR-MDX-NET-Voc_FT.onnx", help="Vocal separation model")
    p.add_argument("--model-dir", type=Path, default=Path.home() / ".cache" / "audio-separator",
                   help="Where separation models are downloaded/cached")
    p.add_argument("--crf", type=int, default=20, help="x264 quality (lower = better)")
    p.add_argument("--keep-music", action="store_true", help="Only remove silence, keep original audio")
    p.add_argument("--keep-silence", action="store_true", help="Only remove music, do not cut")
    args = p.parse_args()

    for tool in ("ffmpeg", "ffprobe", "audio-separator"):
        if not shutil.which(tool):
            sys.exit(f"{tool} not found on PATH")
    output = args.output or args.input.with_name(args.input.stem + "_clean.mp4")

    with tempfile.TemporaryDirectory() as tmp:
        work = Path(tmp)
        wav = work / "audio.wav"
        print("[1/4] Extracting audio...")
        extract_audio(args.input, wav)

        if args.keep_music:
            voice = wav
        else:
            print("[2/4] Separating vocals from music (this is the slow step)...")
            voice = separate_vocals(wav, work, args.model, args.model_dir)

        duration = get_duration(args.input)
        if args.keep_silence:
            segments = [(0.0, duration)]
        else:
            print("[3/4] Detecting silence...")
            silences = detect_silences(voice, args.noise_db, args.min_silence)
            segments = build_keep_segments(silences, duration, args.padding, args.min_keep)
        if not segments:
            sys.exit("No speech detected; try a lower --noise-db")
        kept = sum(e - s for s, e in segments)
        print(f"      Keeping {len(segments)} segments: {kept:.1f}s of {duration:.1f}s")

        print("[4/4] Rendering output...")
        render(args.input, voice, segments, output, work, args.crf)
    print(f"Done -> {output}")


if __name__ == "__main__":
    main()
