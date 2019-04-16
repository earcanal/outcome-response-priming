context('Outcome Response Priming')

## JSON data
participants = data.frame(token = c('1'))

fixture_dir <- '../fixtures/1'
path <- paste0(fixture_dir,'/',participants[1,1],'/outcome-response-priming-task-results.json')
test_that("process_orp() can process a JSON file", {
  expect_silent(process_orp(path, local=TRUE, p=1))
})

