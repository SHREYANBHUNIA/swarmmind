# SwarmMind Enhancement Checklist

- [x] Define the experiment-run schema, recorded metrics, and export format.
- [x] Upgrade the static project to include user-scoped backend and database capabilities.
- [x] Add selectable flocking, formation-control, exploration, and adaptive-relay behaviors to the simulation.
- [x] Persist completed runs and expose an experiment history interface.
- [x] Implement CSV and JSON exports for saved experiment records.
- [x] Treat manual run capture as an explicit completion action before persistence.
- [x] Show the full saved-run history and export every persisted record through a dedicated API path.
- [x] Validate database writes, exports, behavior switching, and responsive layouts.
- [x] Add authenticated API-level tests for saving, listing, and exporting experiment records.
- [x] Verify behavior policy selection and mission completion capture through the application’s interaction logic.
- [x] Save a delivery-ready project checkpoint and provide usage notes.
- [x] Connect the scenario selector to terrain, target, and objective changes in the live simulation.
- [x] Make environment parameters visibly affect map conditions and mission metrics.
- [x] Validate scenario switching on desktop and mobile before delivering the correction.
- [x] Add a focused scenario-selection test covering each environment and URL-linked state.
