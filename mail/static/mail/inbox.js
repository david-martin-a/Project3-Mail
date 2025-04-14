document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#submit1').addEventListener('click', () => save_email());
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#display-email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function save_email() {
  //let x = document.forms["compose-form"];
  var form = new FormData(document.getElementById("compose-form"));
  //var subj = x["compose-form"];
  console.log(form);
  
/*   fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: 'baz@example.com',
        subject: 'Meeting time',
        body: 'How about we meet tomorrow at 3pm?'
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  }); */

  
}

function show_email(id) {
  // Show the display-email-view to display a single email and hide other views
  document.querySelector('#display-email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  // parse WHICH mailbox this email is being opened from (to know whether or not to display archive/unarchive button)
  let emails_container = document.getElementById('emails-view');
  let mailbox = emails_container.dataset.mailbox;
  //console.log(mailbox);
  
  let error_msg = "";
  fetch('/emails/' + id)
    .then(response => response.json())
    .then(email => {
      // TO DO : check if nothing returned, check if user allowed to see this email
      console.log(email);      
      error_msg = email.error;  
      theDiv = document.getElementById('display-email-view');
      // clear out any previous HTML from the page
      theDiv.innerHTML = "" ;
      let y = document.createElement("DIV");
      y.innerHTML = "<b>From: </b>" + email.sender;
      theDiv.appendChild(y);
      let y1 = document.createElement("DIV");

      // Show ALL recipients, not only the first one
      l = "";
      for (let i = 0; i < email.recipients.length; i++) {
        l = l + email.recipients[i] + ', ';
      }
      // Remove the last comma and space from list of recipients
      l = l.slice(0, l.length - 2);
      
      y1.innerHTML = "<b>To: </b>" + l;

      theDiv.appendChild(y1);
      let y2 = document.createElement("DIV");
      y2.innerHTML = "<b>Subject: </b>" + email.subject;
      theDiv.appendChild(y2);
      let y3 = document.createElement("DIV");
      y3.innerHTML = "<b>Timestamp: </b>" + email.timestamp;
      theDiv.appendChild(y3);

      if (mailbox != "sent") {
        let y4 = document.createElement("DIV");
        let y6 = document.createElement("button");
        y6.setAttribute("class", "btn btn-sm btn-outline-primary");
        y6.setAttribute("id", "archive");
        if (mailbox == "inbox") {
          let y5 = document.createElement("button");          
          y5.setAttribute("class", "btn btn-sm btn-outline-primary");
          y5.setAttribute("id", "reply");
          y5.innerHTML = "Reply";
          y4.appendChild(y5);
          y6.setAttribute("onclick", "archive(1, " + email.id + ");");          
          y6.innerHTML = "Archive";
          y4.appendChild(y6);
        }
        if (mailbox == "archive"){
          y6.setAttribute("onclick", "archive(0, " + email.id + ");");
          y6.innerHTML = "Unarchive";
          y4.appendChild(y6);
          
        }
        theDiv.appendChild(y4);
      }

      let y7 = document.createElement("hr");
      theDiv.appendChild(y7);
      let y8 = document.createElement("div");
      y8.innerHTML = email.body;
      theDiv.appendChild(y8);

    })
    .catch(() => {
      console.log('Error: ' + error_msg);
      document.querySelector('#display-email-view').style.display = 'none';
      document.querySelector('#emails-view').style.display = 'block';
      document.querySelector('#compose-view').style.display = 'none';
      //alert(error_msg);
    });
    // Finally, mark this email as read
    fetch('/emails/' + id, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })
  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#display-email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    
    // Mark the page of emails with an indication of WHICH mailbox it is (inbox, archive, sent), to be used when opening an individual email
    let theDiv = document.getElementById('emails-view');
    theDiv.setAttribute("data-mailbox", mailbox);

    // get emails and insert them into the page
    fetch('/emails/' + mailbox)
      .then(response => response.json())
      .then(emails => {
          // Print emails
          //console.log(emails);          

          // Create a DOM DIV element for each email and give it a bootstrap "row" class
          // Each row should have a column (i.e. cell) for 1) Sender, 2) Subject of message, 3) Timestamp
          // Each row should have the email id embedded and be clickable
          

          for (let i = 0; i < emails.length; i++) {                    

            let y = document.createElement("DIV");
            y.setAttribute("class", "row");
            y.setAttribute("onclick", "show_email(" + emails[i].id + ");");



            // Display emails that have been read with grey background
            if (emails[i].read) {
              y.setAttribute("class", "row read");
            }

            let z = document.createElement("DIV");
            z.setAttribute("class", "col-md-3");
            z.innerHTML = emails[i].sender; 
            y.appendChild(z);
            let z1 = document.createElement("DIV");
            z1.setAttribute("class", "col-md-6");
            z1.innerHTML = emails[i].subject; 
            z.after(z1);
            let z2 = document.createElement("DIV");
            z2.setAttribute("class", "col-md-3");
            z2.innerHTML = emails[i].timestamp; 
            z1.after(z2);
            let theDiv = document.getElementById('emails-view');
            theDiv.appendChild(y);  
          }
    }); 
  
}

async function archive(state, id){
  await fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
        archived: state
    })
  });
  // Needed to await fetch result, otherwise the inbox displayed may be stale (not showing email just unarchived)
  load_mailbox("inbox");
}

