$(document).ready(function() {
  var db = getDB();
  var totaltrecords;
  countRecords(db, function (records) { 
    console.log(records);
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

function grabData() {
  $.getJSON('http://www.apievangelist.com/events/api/v1/json/', function(data) {
    var items = data.Events;
    var list = $('#events');
    list.html("");
    $.each(items, function(key, val) {
      var listitem = $(document.createElement('li'));
      listitem.attr('data-icon', 'false');
      listitem.append('<p><a href="#"><h3>' + val.Name + '</h3></p>');
      listitem.append('<p><strong>' + val.City + ', ' + val.State
          + '</strong></p>');
      listitem.append('<p>' + getEventDate(val.Start_Date, val.End_Date)
          + '</p></a>');
      // listitem.append($(document.createElement('p')).html(val.City);
      list.append(listitem);
    });

    list.listview("destroy").listview()

  });

  //document.addEventListener("deviceready", onDeviceReady, false);
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
            data, 
            function(tx, result) { console.log('success'); }, function(error) { console.log('error'); }
         );
        console.log(data);
        });
      });
    $.mobile.hidePageLoadingMsg();
    });

    //list.listview("destroy").listview()

  };

function displayData(db) {

  var list = $('#events')
  db.transaction(function(tx) {
    tx.executeSql('SELECT * FROM calendar', [], function(tx, results) {
      var len = results.rows.length, i;
      for (i = 0; i < len; i++) {
        console.log(results.rows.item(i));
        var result = results.rows.item(i);
        var listitem = $(document.createElement('li'));
        listitem.attr('data-icon', 'false');
        listitem.append('<p><a href="#"><h3>' + result['title'] + '</h3></p>');
        listitem.append('<p><strong>' + result['city'] + ', ' + result['state'] + '</strong></p>');
        listitem.append('<p>' + getEventDate(result['start_date'], result['end_date']) + '</p></a>');
        list.append(listitem);
      }
    });
  });
  
  
  //var listitem = $(document.createElement('li'));
  //listitem.attr('data-icon', 'false');
  //listitem.append('<p><a href="#"><h3>' + val.Name + '</h3></p>');
  //listitem.append('<p><strong>' + val.City + ', ' + val.State
    //  + '</strong></p>');
  //listitem.append('<p>' + getEventDate(val.Start_Date, val.End_Date)
    //  + '</p></a>');
  // listitem.append($(document.createElement('p')).html(val.City);
  //list.append(listitem);
  
  
}
  
  
  //var listitem = $(document.createElement('li'));
  //listitem.attr('data-icon', 'false');
  //listitem.append('<p><a href="#"><h3>' + val.Name + '</h3></p>');
  //listitem.append('<p><strong>' + val.City + ', ' + val.State
    //  + '</strong></p>');
  //listitem.append('<p>' + getEventDate(val.Start_Date, val.End_Date)
    //  + '</p></a>');
  // listitem.append($(document.createElement('p')).html(val.City);
  //list.append(listitem);
  
  