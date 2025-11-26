function createCalendar(calendarId, year, month) {

    let mon = month - 1;
    let d = new Date(year, mon);
    const weekDay = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let week = getWeekNumber(d);

    let table = '<table>';

    table += '<tr><th class="wk">w</th>';
    for (let i = 0; i < weekDay.length; i++) {
      table += '<th>' + weekDay[i] + '</th>';
    }
    table += '</tr>';

    // outer loop to add rows by weeks
    while (d.getMonth() == mon) {
      
      table += '<tr><td class="wk">' + week + '</td>'

      // add spaces before first day of month (for the first row)
      // from Monday till the first day of the month
      // * * * 1  2  3  4
      for (let i = 0; i < getDay(d); i++) {
        table += '<td></td>';
      }

      for (let i = getDay(d); i < 7; i++) {
        table += '<td>' + d.getDate() + '</td>';
        d.setDate(d.getDate() + 1);

        // add spaces after last day of month (for the last row)
        // 29 30 31 * * * *
        if ((d.getMonth() != mon) ){
          for (let j = i + 1; j < 7; j++) {
            table += '<td></td>';
          }
          break;
        }
      }

      table += '</tr>';
      week += 1;
    }

    // close the table
    table += '</table>';

    document.getElementById(calendarId).innerHTML = table;
}

function getDay(date) { // get day number from 0 (monday) to 6 (sunday)
    let day = date.getDay();
    if (day == 0) day = 7; // make Sunday (0) the last day
    return day - 1;
}

const getWeekNumber = (date) => {
    const firstDay = new Date(date.getFullYear(), 0, 1)
    const days = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000))
    return Math.ceil((days + getDay(firstDay) + 1) / 7)
}

window.onload = function() {
    createCalendar('notes-calendar', 2025, 12);
};