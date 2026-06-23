# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.4.0] - 2026-06-23
### Added
- **Floating Timer Window** — A new floating window that keeps the timer always accessible, making it easier to track time without switching views.
- **Reporting Screen** — A new time-based reporting view where you can get an overview of tracked hours across a date range.
- **Entry-Level Report** — Each entry now has its own detailed report screen, letting you drill down into per-entry time statistics.
- **Markdown Editor in Entry Detail** — Notes in entry details are now powered by a full Markdown editor, making it easier to write and format your notes.

### Changed
- **Hour & Minute Time Input** — Time entries can now be entered in `H:MM` format (e.g. `1:30` for 1 hour 30 minutes). The previous rounding option has been removed in favor of this more precise input.
- **Dependency Upgrades** — Core dependencies have been updated to their latest stable versions.
- **Entry Delete** — Entries can now be deleted directly from the entry overview.

## [1.3.0] - 2023-09-14
### Added
- Add check for app updates
- Add estimation input and warning tooltip
- Enhance entry overview
- Initialize estimation of entry
- Modify entry form
- Update dependencies
- Add entry label to overview component header
- Add remove function to timesheet
- Add remove function to todo

### Changed
- Application env structure refactored
- Entry overview refactored
- Entry report component refactored
- Fix extra space between cards

### Fixed
- Fix seed and migration
- Minor fixes
- Fix todo today section

## [1.2.0] - 2023-06-23
### Added
- Add check for app updates
- Add remove function to timesheet
- Add remove function to todo

### Changed
- Application env structure refactored
- Fix extra space between cards

### Fixed
- Fix seed and migration
- Fix todo today section

## 1.1.2 - 2023-06-08
### Changed
- Add remove function to timesheet
- Add remove function to todo

### Fixed
- Fix seed and migration

[Unreleased]: https://github.com/kutay-celebi/ntracker/compare/v1.4.0...HEAD
[1.4.0]: https://github.com/kutay-celebi/ntracker/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/kutay-celebi/ntracker/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/kutay-celebi/ntracker/compare/v1.1.2...v1.2.0
