class NotesCalendar {
  constructor(calendarId, year, month, notes) {
    /**
     * Creates the calendar object.
     * @param {string} calendarId The uniqure html id used to position the calendar object.
     * @param {number} year The initial year the calendar should display.
     * @param {number} month The initial month the calendar should display.
     * @param {Object} notes Data in format {number: {summary: Array.<string>, details: string}, ...}.
     */
    this.calendarDiv = document.getElementById(calendarId);
    if (this.calendarDiv) {

      this.overlayBoard = true; // if user doesn't define a notesboard, an overlaid one need be created
      this.detailsVisible = true;
      this.autoresizeBoard = true;  // influences only static board, overlay is always autoresizable

      if (isNaN(year)) {
        console.error(`Expecting year '${year}' to be a number.`);

      } else if (isNaN(month) || month < 1 || month > 12) {
        console.error(`Expecting month '${month}' to be a number from 1 to 12.`);
        
      } else {
        this.year = year;
        this.month = month;
        this.notes = notes;

        this.calendarDiv.appendChild(this.createCalendarMenu());
        this.calendarDiv.appendChild(this.createCalendar());
      }

    } else {
      console.error(`Missing id '${calendarId}' for note board.`);
    }

  }

  createCalendarMenu() {
    
    const calendarMenu = document.createElement('div');
    calendarMenu.classList.add('notes-calendar-menu');

    this.yearMenu = document.createElement('input');
    this.yearMenu.classList.add('notes-calendar-year');
    this.yearMenu.type = 'number';
    this.yearMenu.value = this.year;
    this.yearMenu.onchange = () => {
      this.year = this.yearMenu.value;
      this.loadCallback(this.year, this.month);
    };

    this.monthMenu = document.createElement('input');
    this.monthMenu.classList.add('notes-calendar-month');
    this.monthMenu.type = 'number';
    this.monthMenu.value = this.month;
    this.monthMenu.onchange = (event) => {
      if (event.target.value > 12) {
        this.yearMenu.value = Number(this.yearMenu.value) + 1;
        this.year = this.yearMenu.value;
        this.month = this.monthMenu.value = 1;
      } else if (this.monthMenu.value < 1) {
        this.yearMenu.value = Number(this.yearMenu.value) - 1;
        this.year = this.yearMenu.value;
        this.month = this.monthMenu.value = 12;
      } else {
        this.month = this.monthMenu.value;
      }
      this.loadCallback(this.year, this.month);
    };

    calendarMenu.append(this.yearMenu, this.monthMenu);

    return calendarMenu;
  }

  createCalendar() {

    let mon = this.month - 1;
    let d = new Date(this.year, mon);
    const weekDay = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let week = this.getWeekNumber(d);

    const table = document.createElement('table');

    let tr = document.createElement('tr');

    let th = document.createElement('th');
    th.classList.add('wk');
    th.textContent = 'w';
    tr.appendChild(th);

    for (let i = 0; i < weekDay.length; i++) {
      th = document.createElement('th');
      th.textContent = weekDay[i];
      tr.appendChild(th);
    }

    table.appendChild(tr);

    // outer loop to add rows by weeks
    while (d.getMonth() == mon) {
      
      tr = document.createElement('tr');

      let td = document.createElement('td');
      td.classList.add('wk');
      td.textContent = week;
      tr.appendChild(td);
      
      // add spaces before first day of month (for the first row)
      // from Monday till the first day of the month
      // * * * 1  2  3  4
      for (let i = 0; i < this.getDay(d); i++) {
        tr.appendChild(document.createElement('td'));
      }

      for (let i = this.getDay(d); i < 7; i++) {

        td = document.createElement('td');

        if (this.notes[d.getDate()]) {
          td.classList.add('noted');
          td.title = this.notes[d.getDate()].summary.join(', ');
        }

        td.textContent = d.getDate();
        td.onclick = ((day) => (e) => this.showNotes(e, day))(d.getDate());

        tr.appendChild(td);
        
        d.setDate(d.getDate() + 1);

        // add spaces after last day of month (for the last row)
        // 29 30 31 * * * *
        if ((d.getMonth() != mon) ){
          for (let j = i + 1; j < 7; j++) {
            tr.appendChild(document.createElement('td'));
          }
          break;
        }
        table.appendChild(tr);
      }

      week += 1;
    }

    return table;
  }

  getDay(date) { // get day number from 0 (monday) to 6 (sunday)
    let day = date.getDay();
    if (day == 0) day = 7; // make Sunday (0) the last day
    return day - 1;
  }

  getWeekNumber = (date) => {
    const firstDay = new Date(date.getFullYear(), 0, 1)
    const days = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000))
    return Math.ceil((days + this.getDay(firstDay) + 1) / 7)
  }

  createNoteBoard(noteboardId, autoresize = true) {
    /** This func will use the provided id to place a static noteboard. If the provided id is not in 
     * the document, the calendar will still fall back to an overlay one.
     * @param {string} noteboardId element id, where the static noteboard should be placed.
     * @param {boolean} autoresize determines whether to autoresize static noteboard, default: true
     */
    this.noteboard = document.getElementById(noteboardId);
    this.autoresizeBoard = autoresize;

    if (this.noteboard) {
      this.overlayBoard = false;

      this.createBoardElements();

    } else {
      console.warn(`Missing id '${noteboardId}' for note board. Falling back to an overlay one.`);
    }
  }

  createBoardElements() {
    this.noteboardDay = 1;

    this.summary = document.createElement('input');
    this.summary.classList.add('note-board-summary');

    if (this.autoresizeBoard || this.overlayBoard)
      this.summary.oninput = () => this.adjustBoardWidth();

    const infoButton = document.createElement('button');
    infoButton.classList.add('note-board-info-button');
    infoButton.innerText = 'i';
    infoButton.onclick = () => this.toggleDetails();

    const editButton = document.createElement('button');
    editButton.classList.add('note-board-edit-button');
    editButton.innerText = 's';
    editButton.onclick = () => this.editNotes();

    this.details = document.createElement('textarea');
    this.details.classList.add('note-board-details');

    if (this.autoresizeBoard || this.overlayBoard)
      this.details.oninput = () => this.adjustBoardWidth();

    this.noteboard.append(this.summary, infoButton, editButton, this.details);
  }

  adjustBoardWidth() {
    let summaryWidth = (this.summary.value.length + 1) * 8;

    let detailsWidth = 0;
    if (this.detailsVisible) {
      let text = this.details.value;
      let lineText = text.split(/\n/);  // wrapping lines can be an issue
      let lines = lineText.length;
      this.details.rows = lines;
      detailsWidth = Math.max(...lineText.map(txt => txt.length)) * 8;
    }

    if (summaryWidth + 40 > detailsWidth) { // i, s buttons 20px each
      this.summary.style.width = summaryWidth + "px";
      this.noteboard.style.width = summaryWidth + 40 + "px";  // i, s buttons 20px each
    } else {
      this.noteboard.style.width = detailsWidth + "px";
      this.summary.style.width = detailsWidth - 40 + "px";  // i, s buttons 20px each
    }

  }

  createOverlayBoard() {
    this.noteboard = document.createElement('div');
    this.noteboard.classList.add('note-board-overlay');
    
    this.noteboard.style.display = 'block';
    this.noteboard.style.position = 'absolute';

    document.body.append(this.noteboard);

    this.createBoardElements();

    this.toggleDetails();

    this.noteboard.onmouseleave = () => this.noteboard.style.display = 'none';
  }

  showNotes(e, day) {

    if (this.selectedCell)
      this.selectedCell.classList.remove('selected-day');

    this.selectedCell = e.target;
    this.selectedCell.classList.add('selected-day');

    // user did not provide a static noteboard, create an overlay one
    if (this.overlayBoard) {

      let boundingRect = e.target.getBoundingClientRect();

      if (this.noteboard) {
        this.noteboard.style.display = 'block';
        
      } else {
        this.createOverlayBoard();
      }

      // position bellow element from which event was initiated
      this.noteboard.style.top = boundingRect.bottom + 'px';
      this.noteboard.style.left = boundingRect.left + 'px';
    }

    this.noteboardDay = day;

    if (this.notes[day]) {
      this.summary.value = this.notes[day].summary.join(', ');
      this.details.value = this.notes[day].details;
    }
    else {
      this.summary.value = '';
      this.details.value = '';
    }

    if (this.autoresizeBoard || this.overlayBoard)
      this.adjustBoardWidth();
  }

  toggleDetails() {
    if (this.details)
      this.details.style.display = window.getComputedStyle(this.details).display == 'inline-block' ? 
        'none' : 'inline-block';
      this.detailsVisible = this.details.style.display == 'none' ? false : true;

      if (this.autoresizeBoard || this.overlayBoard)
        this.adjustBoardWidth();
  }

  editNotes() {
    
    const day = this.noteboardDay;

    const summary = this.summary.value;
    const summaryTags = summary.split(',').map((e) => e.trim());

    const details = this.details.value;

    if (this.overlayBoard) {
      this.noteboard.style.display = 'none';
    }

    this.saveNote(this.year, this.month, day, summaryTags, details);
  }

  saveNote(year, month, day, summary, details) {

    this.notes[day] = {summary: summary, details: details};

    if (summary.join(', ') == '' && details == '') {
      this.selectedCell.classList.remove('noted');
      delete this.notes[day];
    } else {
      this.selectedCell.classList.add('noted');
    }
    
    this.selectedCell.title = summary.join(', ');

    this.saveCallback(year, month, day, summary, details);
  }

  reloadCalendar(notes) {
    /** The func is expected to be called when defining the callback to load notes 
     * for a new year or month.
     * @param {Object} notes Data in format {number: {summary: Array.<string>, details: string}}.
     */
    this.notes = notes;
    this.calendarDiv.replaceChild(
      this.createCalendar(this.year, this.month, this.notes), 
      this.calendarDiv.children[1]);
  }

  /**
   * The func is expected to have 2 params: year, month.
   * The year and month are expected to be numbers.
   * The function is expected to call the calendar's object method reloadCalendar(notes),
   *  where notes contain the day notes for that year+month in the same format 
   *  the calendar object was created with.
   * @param {*} func 
   */
  defineCallbackLoad(func) {
    this.loadCallback = func;
  }

  /**
   * The func is expected to have 5 params: year, month, day, summary, details.
   * The year, month and day are expected to be numbers.
   * The summary is expected to be an array of strings.
   * The details is expected to be a string.
   * @param {*} func 
   */
  defineCallbackSave(func) {
    this.saveCallback = func;
  }

}
