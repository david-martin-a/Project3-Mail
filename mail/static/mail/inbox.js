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
  alert("Hi!");
}

function show_email(id) {
  // Show the display-email-view and hide other views to display a single email
  document.querySelector('#display-email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  let error_msg = "";
  fetch('/emails/' + id)
    .then(response => response.json())
    .then(email => {
      // TO DO : check if nothing returned, check if user allowed to see this email
      console.log(email);
      if (email.error) {
        error_msg = email.error;
      }

      theDiv = document.getElementById('display-email-view');
      theDiv.innerHTML = "" ;
      let y = document.createElement("DIV");
      y.innerHTML = "<b>From: </b>" + email.sender;
      theDiv.appendChild(y);
      let y1 = document.createElement("DIV");
      // TO DO: show ALL recipients, not only first one
      y1.innerHTML = "<b>To: </b>" + email.recipients[0];
      theDiv.appendChild(y1);
      let y2 = document.createElement("DIV");
      y2.innerHTML = "<b>Subject: </b>" + email.subject;
      theDiv.appendChild(y2);
      let y3 = document.createElement("DIV");
      y3.innerHTML = "<b>Timestamp: </b>" + email.timestamp;
      theDiv.appendChild(y3);
      let y4 = document.createElement("DIV");
      //y4.innerHTML = "<b>Subject: </b>" + email.subject;
      let y5 = document.createElement("button");
      y5.innerHTML = "Reply";
      y5.setAttribute("class", "btn btn-sm btn-outline-primary");
      y5.setAttribute("id", "reply");
      y4.appendChild(y5);
      theDiv.appendChild(y4);
      let y6 = document.createElement("hr");
      theDiv.appendChild(y6);
      let y7 = document.createElement("div");
      y7.innerHTML = email.body;
      theDiv.appendChild(y7);

    })
    .catch(() => {
      console.log('Error: ' + error_msg);
      document.querySelector('#display-email-view').style.display = 'none';
      document.querySelector('#emails-view').style.display = 'block';
      document.querySelector('#compose-view').style.display = 'none';
      //alert(error_msg);
    });


  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#display-email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  // get emails and print them to the console initially
  if(mailbox == "inbox"){
    // Get all emails TO this user that are not archived    
    // alert('mailbox');
    fetch('/emails/inbox')
      .then(response => response.json())
      .then(emails => {
          // Print emails
          console.log(emails);          

          // Create a DOM DIV element for each email and give it a bootstrap "row" class
          // Each row should have a column (i.e. cell) for 1) Sender, 2) Subject of message, 3) Timestamp
          // Each row should have the email id embedded and be clickable
          

          for (let i = 0; i < emails.length; i++) {                    

            let y = document.createElement("DIV");
            y.setAttribute("class", "row");
            y.setAttribute("onclick", "show_email(" + emails[i].id + ");")

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
            theDiv = document.getElementById('emails-view');
            theDiv.appendChild(y);  
          }
    }); 
  }
}

