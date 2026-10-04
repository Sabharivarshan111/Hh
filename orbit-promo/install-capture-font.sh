#!/usr/bin/env bash
set -eu
font_dir="${XDG_DATA_HOME:-$HOME/.local/share}/fonts/orbit-capture"
mkdir -p "$font_dir"
cp capture-fonts/NotoColorEmoji.ttf "$font_dir/"
fc-cache -f "$font_dir"
fc-match emoji
