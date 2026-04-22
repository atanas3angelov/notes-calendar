# Notes Calendar

## About the project

In development...

Notes-calendar is a JavaScript lib providing an interactive calendar widget for a webpage that allows one to make notes on the days of a month. It's designed with the intention that a backend service will be used to persist those notes. A note for a specific day consists of a short summary of tags and a text to provide more details (usually about the tags).


## Why Notes-calendar?

The initial purpose for it was to aid in identifying skills that need to be refreshed. Without periodic review of newly learned knowledge over time it is harder to recall it (see <a href="https://en.wikipedia.org/wiki/Forgetting_curve">the Forgetting curve</a>). Therefore, identifying that a skill needs to be refreshed (with a follow-up action) will help with memory retention. The first steps are to collect data and boost the intuition with visualization. This is where the Notes-calendar comes in: tag a day with a new skill summary (e.g. "go" or "python" or both: "go, python") and optionally add more details about what was learned or where the knowledge came from (e.g. "A Tour of Go: variables & functions" or "python: pandas, generators, enumerate"). You decide what tag(s) the summary has and whether the details section will be used (you can toggle it off and on).

The inspiration for the Notes-calendar actually came from both a calendar on which holidays were described in short and in details (in a legend section) and a "Birthdays calendar" on which there is enough space for a short text for each day in a 366-day calendar year. So the Notes-calendar can also be used for that purpose.

## Integration

Both notes-calendar.js and notes-calendar.css are needed to integrate NotesCalendar into a webpage. They can be added to the head tag or their contents can be added to existing js and css files.

```html
<link rel="stylesheet" href="./notes-calendar.css">
<script src="./notes-calendar.js"></script>
```

Creating an instance of NotesCalendar requires:

* @param {string} calendarId The uniqure html id used to position the calendar object.
* @param {number} year The initial year the calendar should display.
* @param {number} month The initial month the calendar should display.
* @param {Object} notes Data in format ```{number: {summary: Array.<string>, details: string}, ...}```.

```javascript
const notesCalendar = new NotesCalendar('notes-calendar', 2025, 12, notes);
```

A sample for the notes format ```day number: { summary: ["tag 1", "tag 2"...], details: "details text" }``` is as follows:

```javascript
{
    3:  {summary: ["go"], details: "A Tour of Go: variables & functions"},
    5:  {summary: ["go", "python"], details: "A Tour of Go: flow control - if, else, switch, defer\n python - enumerate\nc# closures\njava enhanced for loop"},
    12: {summary: ["go"], details: ""},
    20: {summary: ["js", "css", "html"], details: "creating a calendar with js"},
    25: {summary: ["css"], details: "css universal selector and combinators"},
}
```

Two important callbacks need to be implemented and then defined as callbacks for the NotesCalendar:

* callback that loads all the notes for a given month
* callback that saves the notes for a specific day

```javascript
const callbackLoad = (year, month) => {
    /* logic to load the notes from the Backend */                    
    notesCalendar.reloadCalendar(notes);
};
notesCalendar.defineCallbackLoad(callbackLoad);


const callbackSave = (year, month, day, summary, details) => {
    /* logic to save the notes for a specific day to the Backend */
}
notesCalendar.defineCallbackSave(callbackSave);

```

> [!IMPORTANT]  
> The last statement in the callback to load the notes for a given month needs to reload the calendar notes.


A sample integration into a webpage with a Backend in Golang (+Gin web framework) and MongoDB can be found <a href="https://github.com/atanas3angelov/notes-calendar-ws">here</a>.

## Features

1. Overlay Board

Usually a space on the webpage should be provided where the notes for a day will be created/updated also known as the "Noteboard". That space should be a div with an id like "note-board" and then the id must be passed to the NotesCalendar instance with the method "createNoteBoard".

```
notesCalendar.createNoteBoard('note-board', false);
```

> [!NOTE]  
> If you change the name of the id, be sure to change its name in the notes-calendar.css as well. The 2nd parameter determines whether one wishes to minimize the space the Noteboard will use by autoresizing itself as you write - not recommended with a dedicated Noteboard.

Howerver, if such space (+id) is not provided, then the NotesCalendar will automatically use an "Overlay Board" making an overlay Noteboard appear just below the selected day. That makes the NotesCalendar self-sufficient in terms of the space on the page it requires for its interactivity - the recommended way of using NotesCalendar.

> [!NOTE]  
> Behind the scene a div with a <u>class</u> "note-board-overlay" is created for the Overlayboard. This info should serve so that you can provide custom styling to it. Note that it is a class and not an id.

2. Calendar Summary

There's a button ("+") that brings down an overlayed legend (the "Calendar Summary") below the calendar with all the tagged days and their tags (the details section is not included). After expansion the button's text is changed to "-" and it can be used to hide the Calendar Summary. The calendar summary is useful since one doesn't need to hover over each individual day in order to see the tags associated with it.

3. Settings

There's a button ("*") that brings down an overlayed list of additional interactivity (the "Settings Menu") so that the main functionality preserves its simplicity and unobstrusive nature. Additional interactivity is listed below.

   * Export / Import  
    NotesCalendar requires a Backend service to save/load the notes for the days of the month. However, it also allows the notes for the current month to be exported into a JSON file and subsequently imported. This might be useful in cases when the Backend service is (temporary) unavailable. One more callback (aside of the 2 main to load notes for the month and save notes for a specific day) needs to be defined, in order to save the newly imported notes for the month to a persistent source on the Backend.

```javascript
const callbackImportSave = (year, month, notes) => { /* logic to save the notes to the Backend */ };

notesCalendar.defineCallbackImportSave(callbackImportSave);
```


