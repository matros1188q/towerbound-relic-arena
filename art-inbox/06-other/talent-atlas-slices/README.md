# Talent atlas slices — active runtime assets

The 550 PNG files in this folder were incorrectly moved out of the runtime asset directory during an earlier cleanup. They are used by the seven-class talent tree: `configs/talents_tree.json` contains 490 nodes and references 425 distinct icon files under `./assets/talents/`.

The original paths have been restored in `assets/talents/`. Keep the PNGs there: the tree loads each node icon from its configured path. Do not archive or remove these files based only on a static JavaScript search; the references are data-driven in JSON.

This folder is retained only as a note about the source-art workflow; the runtime copies live in `assets/talents/`.
