# Dashboard Improvements TODO

- [ ] 1. Update `src/components/TableauDeBord/Dashboard.js`
  - [ ] Add `useMemo` for derived KPI values
  - [ ] Make KPI numeric values robust (`Number(...) || 0`)
  - [ ] Improve chart block wrappers consistency

- [x] 2. Update `src/components/TableauDeBord/MetricsCard.js`
  - [x] Add support for optional props: `message`, `subtitle`, `trend`
  - [x] Improve empty value rendering (`--`)

- [ ] 3. Update `src/components/TableauDeBord/charts/AppelsChart.js`
  - [ ] Refactor with `useMemo`
  - [ ] Fix inclusive date range filtering
  - [ ] Improve pie chart visual consistency + tooltip/legend polish

- [ ] 4. Update `src/components/TableauDeBord/charts/DesistementChart.js`
  - [ ] Remove debug logs
  - [ ] Improve date parsing robustness/performance
  - [ ] Improve pie chart visual consistency + empty state

- [ ] 5. Update `src/components/TableauDeBord/VentesChart.js`
  - [ ] Remove debug logs
  - [ ] Light visual harmonization (ticks/spacing/tooltip behavior)

- [ ] 6. Update `src/components/TableauDeBord/VisitesChart.js`
  - [ ] Light visual harmonization (ticks/spacing/tooltip behavior)
  - [ ] Minor transform optimization/readability

- [ ] 7. Update `src/components/TableauDeBord/EncaissementChart.js`
  - [ ] Remove unused imports/branches
  - [ ] Minor aggregation optimization cleanup

- [ ] 8. Validation
  - [ ] Run lint/build checks for frontend
  - [ ] Final pass summary (design/performance/robustness)
