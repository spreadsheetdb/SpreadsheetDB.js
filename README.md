# SpreadsheetDB.js

SpreadsheetDB.js is a JavaScript library allowing to compute [SpreadsheetDB](https://www.spreadsheetdb.io)'s spreadsheets from web pages.
For more information, read the [SpreadsheetDB.js guide section](https://www.spreadsheetdb.io/doc/guide#spreadsheetdbjs) of the documentation.

## Setup

To include SpreadsheetDB.js in your page either copy [spreadsheetdb.js](./spreadsheetdb.js) in your repository or include it directly from
[spreadsheetdb.io](https://www.spreadsheetdb.io):

```javascript
<script src="https://www.spreadsheetdb.io/js/spreadsheetdb.min.js"></script>
```

## Methods

### spreadsheetdb.get()

Computes a spreadsheet.

#### Parameters

Parameter | Type | Mandatory | Description
--- | --- | --- | ---
spreadsheet | string | yes | Spreadsheet name
key | string | yes | Spreadsheet key
cb | function | yes | Callback
refresh | number | no | Refresh delay in ms. If this parameter is set, the callback will be called at regular interval, forever. spreadsheetdb.get() returns the setInterval() id, that can be stopped with clearInterval(id).
begin | string or array | no | Specifies the begin cell (top-left) of a spreadsheet zone.
end | string or array | no | Specifies the end (bottom-right) cell of a spreadsheet zone.

#### Callback

The callback always takes 2 arguments: an error and the result.

```javascript
spreadsheetdb.get({
  name: "demo",
  key: "VUbJcxt3uQQ4NHcHVh7iwcLTXbdR8VqUGstIQNBati47P7EBeC",
  cb: function(error, result) {
    // ...
  }
});
```

The error must always be checked first. It is an object similar to those returned by the API:

```json
{
    "error": "CircularReference",
    "errorText": "circular reference detected (0,0 -> 2,3 -> 1,1 -> 0,0)"
}
```

More information and full list of error codes available [here](https://www.spreadsheetdb.io/doc/errors).

If `begin` and `end` parameters are not defined, `result` contains the full spreadsheet, exactly like an
API call to [GET /spreadsheet/:name](https://www.spreadsheetdb.io/doc/api#get-spreadsheet-name) would.

Here is an example:

```json
{
    "creationDate": 1467661881399,
    "key": "Pe8GcqnMUngK5MkFkQYSAwGkA1kFODXuHV0JcemXrtyn6ISgoH",
    "name": "hello-world",
    "cells": {
        "0,0": {
            "value": "hello world",
            "result": "hello world"
        },
        "0,1": {
            "value": "=1+1",
            "result": 2
        }
    }
}
```

Specifying a zone can be useful to build a chart or a table from a specific part of a spreadsheet. If
`begin` and `end` parameters are specified, the `result` object looks like this:

```json
{
    "columns": ["2014", "2015", "2016", "2017"],
        "rows": [
        {
            "label": "Alice",
            "data": [17, 15, 12, 13]
        },
        {
            "label": "Bob",
            "data": [6, 7, 10, 16]
        },
        {
            "label": "Eve",
            "data": [10, 16, 11, 15]
        }
    ]
}
```

SpreadsheetDB.js tries to guess the labels and the column names by looking outside the zone. If it fails,
the values are `undefined`.
This object can easily be used to build charts, using any library, or any kind of visualization tool.

#### Demos

Demos are available on jsFiddle:
* [Chart.js demo](https://jsfiddle.net/SpreadsheetDB/0kr59Lxr/)
* [Flot demo](https://jsfiddle.net/SpreadsheetDB/6z4c1sfw/)

### spreadsheetdb.convertCoords()

Converts spreadsheet coordinates from `A1` notation to `x,y` notation and opposite.

Examples:
```javascript
spreadsheetdb.convertCoords("C7") // returns [2, 6]
spreadsheetdb.convertCoords([2, 6]) // returns "C7"
```

More information about cell coordinates notation is available in the [guide](https://www.spreadsheetdb.io/doc/guide#cell-coordinates).
