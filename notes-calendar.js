class NotesCalendar {
  constructor(calendarId, year, month, notes) {
    this.calendarDiv = document.getElementById(calendarId);
    this.year = year;
    this.month = month;
    this.notes = notes;

    this.calendarDiv.appendChild(this.createCalendarMenu(year, month));
    this.calendarDiv.appendChild(this.createCalendar(year, month, notes));

  }

  createCalendarMenu(year, month) {
    
    const calendarMenu = document.createElement('div');
    calendarMenu.setAttribute('id', 'notes-calendar-menu');

    this.yearMenu = document.createElement('input');
    this.yearMenu.setAttribute('id', 'notes-calendar-year');
    this.yearMenu.type = 'number';
    this.yearMenu.value = year;
    this.yearMenu.onchange = () => {
      console.log('year changed to ' + this.yearMenu.value);
    };

    this.monthMenu = document.createElement('input');
    this.monthMenu.setAttribute('id', 'notes-calendar-month');
    this.monthMenu.type = 'number';
    this.monthMenu.value = month;
    this.monthMenu.onchange = () => {
      console.log('month changed to ' + this.monthMenu.value);
    };

    calendarMenu.append(this.yearMenu, this.monthMenu);

    return calendarMenu;
  }

  createCalendar(year, month, notes) {

    let mon = month - 1;
    let d = new Date(year, mon);
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

        if (notes[d.getDate()]) {
          td.classList.add('noted');
          td.title = notes[d.getDate()].summary.join(', ');
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

  createNoteBoard(noteboardId) {
    this.noteboard = document.getElementById(noteboardId);

    this.noteboardDay = 1;

    this.summary = document.createElement('input');
    this.summary.setAttribute('id','note-board-summary');

    const infoButton = document.createElement('button');
    infoButton.setAttribute('id', 'note-board-info-button');
    infoButton.innerText = 'i';
    infoButton.onclick = () => this.toggleDetails();

    const editButton = document.createElement('button');
    editButton.setAttribute('id', 'note-board-edit-button');
    editButton.innerText = 's';
    editButton.onclick = () => this.editNotes();

    this.details = document.createElement('textarea');
    this.details.setAttribute('id', 'note-board-details');

    this.noteboard.append(this.summary, infoButton, editButton, this.details);
  }

  showNotes(e, day) {

    if (this.selectedCell)
      this.selectedCell.classList.remove('selected-day');

    this.selectedCell = e.target;
    this.selectedCell.classList.add('selected-day');

    this.noteboardDay = day;

    if (this.notes[day]) {
      this.summary.value = this.notes[day].summary.join(', ');
      this.details.value = this.notes[day].details;
    }
    else {
      this.summary.value = '';
      this.details.value = '';
    }
  }

  toggleDetails() {

    if (this.details) // if user defined where the noteboard should be placed
      this.details.style.display = window.getComputedStyle(this.details).display == 'inline-block' ? 
        'none' : 'inline-block';
    
    // else add it as an overlay on the calendar ...TO DO
  }

  editNotes() {
    
    const day = this.noteboardDay;

    const summary = this.summary.value;

    const details = this.details.value;

    this.saveNote(2025, 12, day, summary.split(',').map((e) => e.trim()), details);
  }

  saveNote(year, month, day, summary, details) {

    notes[day] = {summary: summary, details: details};

    if (summary.join(', ') == '' && details == '') {
      this.selectedCell.classList.remove('noted');
      delete notes[day];
    } else {
      this.selectedCell.classList.add('noted');
    }
    
    this.selectedCell.title = summary.join(', ');

    this.saveCallback(year, month, day, summary, details);
  }

  defineCallbackSave(func) {
    this.saveCallback = func;
  }

}
