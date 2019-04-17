# mocha_csv
How to run Node API tests using Mocha and a csv file
It needs to run with --delay flag to allow the CSV to be parsed
mocha index.js --delay
# Steps
1. npm run server
2. mocha index.js --delay -p ./test/test.csv -h localhost
