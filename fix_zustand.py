import os
import re

files = [
    "src/components/AddToPlaylistModal.jsx",
    "src/components/AudioPlayer.jsx",
    "src/components/CreatePlaylistModal.jsx",
    "src/components/layout/Lyrics.jsx",
    "src/components/layout/LyricsView.jsx",
    "src/components/layout/NavRail.jsx",
    "src/components/layout/NowPlayingSidebar.jsx",
    "src/components/layout/PlayerBar.jsx",
    "src/components/layout/QueueDrawer.jsx",
    "src/pages/Browse.jsx",
    "src/pages/Library.jsx",
    "src/pages/PlaylistDetail.jsx",
    "src/pages/Search.jsx"
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    if "useShallow" not in content and "usePlayerStore" in content:
        content = re.sub(r"(import .*usePlayerStore.*)", r"\1\nimport { useShallow } from 'zustand/react/shallow';", content)
        
    def replace_match(m):
        vars_str = m.group(1)
        vars_list = [v.strip() for v in vars_str.replace('\n', ' ').split(',') if v.strip()]
        state_mapping = ", ".join([f"{v}: state.{v}" for v in vars_list])
        return f"const {{ {', '.join(vars_list)} }} = usePlayerStore(useShallow(state => ({{ {state_mapping} }})));"

    new_content = re.sub(r"const\s+\{([^}]+)\}\s*=\s*usePlayerStore\(\);", replace_match, content, flags=re.MULTILINE)
    
    if new_content != content:
        with open(file, 'w') as f:
            f.write(new_content)
        print(f"Fixed {file}")

