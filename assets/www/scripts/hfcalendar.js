$(document).ready(function() {
  var db = getDB();
  var totaltrecords;
  countRecords(db, function (records) { 
    if (records == 0 ) {
      updateDatabase(db);
    } else {
      displayData(db);
    }
    });
});

function getDB() {
  var db = openDatabase("hfcalendar", "1.0", "Hackfest Calendar", 500000);
  db
      .transaction(function(tx) {
        tx
            .executeSql(
                'CREATE TABLE IF NOT EXISTS calendar ('
                    + 'id INTEGER, title TEXT, description TEXT, start_date TEXT, end_date TEXT, url TEXT, address TEXT,'
                    + 'city TEXT, state TEXT, zipcode TEXT, country TEXT, post_date TEXT, email TEXT, hashtag TEXT, twitter TEXT)',
                []);
      });
  return db;
}

function countRecords(db, callback) {
  var val;
  db.transaction(function(tx) {
    tx.executeSql('SELECT COUNT(*) as rows FROM calendar', [], function(tx, rs) {
      // console.log(rs.rows.item(0)['rows']);
      callback(rs.rows.item(0)['rows']);
    });
  });
  return val;
}


function updateDatabase(db) {
  $.mobile.showPageLoadingMsg();
  
  $.getJSON('http://www.apievangelist.com/events/api/v1/json/', function(data) {
    var items = data.Events;
    var list = $('#events');
    list.html("");
    $.each(items, function(key, val) {
      //console.log(val);
      var about = val.About;
      about = about.replace(/\"/g, "'");
      var data = [parseInt(val.ID), val.Name, about, val.Start_Date, val.End_Date, val.URL, val.Address, val.City, val.State, val.Postal_Code, val.Country, val.Post_Date, val.Email, val.HashTag, val.TwitterHandle];
      db.transaction(function(tx) {
        tx.executeSql('INSERT INTO calendar (id,title,description,start_date,end_date,url,address,city,state,zipcode,country,post_date,email,hashtag,twitter)' +
            ' VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);', 
            data
         );
        });
      });
    $.mobile.hidePageLoadingMsg();
    });
  };

function displayData(db) {

  var list = $('#events')
  db.transaction(function(tx) {
    tx.executeSql('SELECT * FROM calendar', [], function(tx, results) {
      var len = results.rows.length, i;
      for (i = 0; i < len; i++) {
        var result = results.rows.item(i);
        var listitem = $(document.createElement('li'));
        listitem.attr('data-icon', 'arrow-r');
        var itemText = '<a href="#event">';
        itemText = itemText + '';
        itemText = itemText + '<h2>' + result['title'] + '</h2>';
        itemText = itemText + '<p><strong>' + getLocationString(result['city'], result['state']) + '</strong></p>';
        itemText = itemText + '<p>' + getEventDate(result['start_date'], result['end_date']) + '</p>';
        itemText = itemText + '</a>';
        listitem.append(itemText);
        list.append(listitem);
      }
      $('#events').listview('refresh');
    });
  });  
}

function simpleDate(dateValue) {
  if (dateValue.length > 0) {
    return dateValue.substring(5, 10);
  } else {
    return '';
  }
}

function getEventDate(startDate, endDate) {
  startDate = simpleDate(startDate);
  endDate = simpleDate(endDate);

  if (startDate == endDate) {
    return monthName(Number(startDate.substring(0, 2))) + ' '
        + Number(startDate.substring(3, 5));
  } else {
    startDate = monthName(Number(startDate.substring(0, 2))) + ' '
        + Number(startDate.substring(3, 5));
    endDate = monthName(Number(endDate.substring(0, 2))) + ' '
        + Number(endDate.substring(3, 5));
    return startDate + ' to ' + endDate;
  }
}

function getLocationString(city, state) {

  if (city.length > 0 && state.length > 0) {
    return city + ', ' + state;
  } else {
    if (city.length > 0) {
      return city;
    } else {
      return state;
    }
  }
}

function monthName(monthValue) {
  var month = new Array();
  month[0] = "January";
  month[1] = "February";
  month[2] = "March";
  month[3] = "April";
  month[4] = "May";
  month[5] = "June";
  month[6] = "July";
  month[7] = "August";
  month[8] = "September";
  month[9] = "October";
  month[10] = "November";
  month[11] = "December";
  return month[monthValue];
}
  