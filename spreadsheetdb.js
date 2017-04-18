/* SpreadsheetDB.js
 * Copyright https://www.spreadsheetdb.io
 */

spreadsheetdb = {};

/* Spreadsheets cache. */
spreadsheetdb.sheets = {};

/* Builds spreadsheet zone result. */
spreadsheetdb._buildZone = function(params) {
    if (typeof(params.begin) === "string") {
        try {
            params.begin = spreadsheetdb.convertCoords(params.begin);
        } catch(err) {
            return params.cb(err);
        }
    }

    if (typeof(params.end) === "string") {
        try {
            params.end = spreadsheetdb.convertCoords(params.end);
        } catch(err) {
            return params.cb(err);
        }
    }

    error = spreadsheetdb._checkParam(params, "begin", "array", 2);
    if (error !== undefined)
        return params.cb(error);

    error = spreadsheetdb._checkParam(params, "end", "array", 2);
    if (error !== undefined)
        return params.cb(error);

    var res = {
        rows: [],
        columns: []
    };
    var cells = spreadsheetdb.sheets[params.spreadsheet].spreadsheet.cells;

    for (var y = params.begin[1]; y <= params.end[1]; y++) {
        var labelCoords = params.begin[0] - 1 + "," + y;
        var row = {
            data: []
        };

        if (labelCoords in cells && cells[labelCoords].result !== undefined) {
            row.label = cells[labelCoords].result;
        }

        for (var x = params.begin[0]; x <= params.end[0]; x++) {
            var coords = x + "," + y;

            if (!(coords in cells))
                return params.cb("cell " + coords + " does not exist");

            if (typeof(cells[coords].result) != "number")
                return params.cb("cell " + coords + " result is not a number");

            row.data.push(cells[coords].result);
        }

        res.rows.push(row);
    }

    for (var x = params.begin[0]; x <= params.end[0]; x++) {
        var colLabelCoords = x + "," + (params.begin[1] - 1);
        var colLabel;

        if (colLabelCoords in cells && cells[colLabelCoords].result) {
            colLabel = cells[colLabelCoords].result;
        }

        res.columns.push(colLabel);
    }

    return params.cb(undefined, res);
}

spreadsheetdb._checkParam = function(params, key, type, len) {
    if (!(key in params))
        return 'parameter "' + key + '" is missing';

    switch (type) {
      case "array":
        if (typeof(params[key]) != "object")
            return 'parameter "' + key + '" is not an array';
        if (!params[key].hasOwnProperty("length"))
            return 'parameter "' + key + '" is not an array';
        if (params[key].length != len)
            return 'array "' + key + '" should have a length of ' + len;
        break;

      default:
        if (typeof(params[key]) != type)
            return 'parameter "' + key + '" is not a ' + type;
        break;
    }
}

/* Computes a spreadsheet */
spreadsheetdb.get = (function(params) {
    if (params == undefined)
        throw "missing parameters object";
    if (typeof(params) != "object")
        throw "parameters are not an object";
    if (!("cb" in params))
        throw 'parameter "cb" is missing';
    if (typeof(params.cb) != "function")
        throw 'parameter "cb" is not a function';

    var error = spreadsheetdb._checkParam(params, "spreadsheet", "string");
    if (error !== undefined)
        return params.cb(error);

    error = spreadsheetdb._checkParam(params, "key", "string");
    if (error !== undefined)
        return params.cb(error);

    document.addEventListener("spreadsheetdbReady", function() {
        var res = spreadsheetdb.sheets[params.spreadsheet];

        if (!res.success)
            return params.cb(res);

        if (!("begin" in params) && !("end" in params))
            return params.cb(undefined, res.spreadsheet);

        spreadsheetdb._buildZone(params);
    });


    var loadSpreadsheet = (function() {
        var s = document.createElement("script");
        var url = "https://api.spreadsheetdb.io/spreadsheet/" +
            params.spreadsheet + ".js?key=" + params.key;

        s.setAttribute("src", url);
        s.onload = (function() {
            /* Remove script once loaded to avoid surcharging the DOM. */
            document.body.removeChild(s);
        });
        s.onerror = (function(){
            document.body.removeChild(s);

            return params.cb({
                success: false,
                error: "UnknownSpreadsheet",
                errorText: "bad name or key"
            });
        });

        document.body.appendChild(s);
    });

    loadSpreadsheet();

    if ("refresh" in params) {
        var error = spreadsheetdb._checkParam(params, "refresh", "number");
        if (error !== undefined)
            return params.cb(error);
        if (params.refresh < 200)
            return params.cb('parameter "refresh" is too low');
        return setInterval(loadSpreadsheet, params.refresh);
    }
});

/* Converts cell coordinates from A1 to x,y notation, or the opposite */
spreadsheetdb.convertCoords = (function(coords) {
    if (typeof(coords) !== "string") {
        var x = "";

        for (var n = coords[0]; n >= 0; n--) {
            x = String.fromCharCode(65 + n % 26) + x;
            n = Math.floor(n / 26);
        }

        return x + (coords[1] + 1);
    }

    var rx = /([A-Z]+)([0-9]+)/;
    var match = rx.exec(coords.toUpperCase());

    if (match.length != 3)
        throw 'cannot parse coordinates "' + coords + '"';

    var x = 0;

    for (var i = 0; i < match[1].length; i++) {
        var factor = Math.pow(26, match[1].length - 1 - i);
        var val = 1 + match[1].charCodeAt(i) - "A".charCodeAt(0);

        x += val * factor;
    }

    return [x - 1, match[2] - 1];
});

