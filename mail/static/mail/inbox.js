document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email(0));
  document.querySelector('#submit1').addEventListener('click', () => save_email());
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(id) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#display-email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // For a new email, the default id when calling this function will be 0
  // If this is a **reply** to an email, the id will be something > 0, and we must prefill the appropriate fields  
  if (id > 0) {
    //alert(id);
    fetch('/emails/' + id)
      .then(response => response.json())
      .then(email => {
        document.querySelector('#compose-recipients').value = email.sender;
        subj = email.subject;
        if (subj.slice(0, 4) != "Re: ") {
          subj = "Re: " + subj;
        }
        document.querySelector('#compose-subject').value = subj;
        body = "On " + email.timestamp + " " + email.sender + " wrote: \n\n" + email.body;
        document.querySelector('#compose-body').value = body;
      });
  }

}

function save_email() {
  
  const to = document.getElementById("compose-recipients").value;
  const subj = document.getElementById("compose-subject").value;
  let body = document.getElementById("compose-body").value;    
  
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: to,
        subject: subj,
        body: body,
        read: 0
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      // Go to Sent mailbox
      load_mailbox('sent');
  });  
}

function show_email(id) {

  // Show the display-email-view to display a single email and hide other views
  document.querySelector('#display-email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // parse WHICH mailbox this email is being opened FROM (to know whether or not to display archive/unarchive and reply buttons)
  let emails_container = document.getElementById('emails-view');
  let mailbox = emails_container.dataset.mailbox;  
  
  let error_msg = "";
  fetch('/emails/' + id)
    .then(response => response.json())
    .then(email => {
      // TO DO : check if nothing returned, check if user allowed to see this email
      console.log(email);      
      error_msg = email.error;  
      const theDiv = document.getElementById('display-email-view');
      // clear out any previous HTML from the page
      theDiv.innerHTML = "" ;
      const y = document.createElement("DIV");
      y.innerHTML = "<b>From: </b>" + email.sender;
      theDiv.appendChild(y);
      const y1 = document.createElement("DIV");

      // Show ALL recipients, not only the first one
      let recipients = email.recipients.toString();
      recipients = recipients.replace(",", ", "); 
      y1.innerHTML = "<b>To: </b>" + recipients;

      theDiv.appendChild(y1);
      const y2 = document.createElement("DIV");
      y2.innerHTML = "<b>Subject: </b>" + email.subject;
      theDiv.appendChild(y2);
      const y3 = document.createElement("DIV");
      y3.innerHTML = "<b>Timestamp: </b>" + email.timestamp;
      theDiv.appendChild(y3);

      if (mailbox != "sent") {
        const y4 = document.createElement("DIV");
        const y6 = document.createElement("button");
        y6.setAttribute("class", "btn btn-sm btn-outline-primary");
        y6.setAttribute("id", "archive");
        if (mailbox == "inbox") {
          const y5 = document.createElement("button");          
          y5.setAttribute("class", "btn btn-sm btn-outline-primary");
          y5.setAttribute("id", "reply");
          y5.setAttribute("onclick", "compose_email(" + email.id + ");");
          y5.innerHTML = "Reply";
          y4.appendChild(y5);
          y6.setAttribute("onclick", "archive(1, " + email.id + ");");          
          y6.innerHTML = "Archive";
          y4.appendChild(y6);
        }
        else if (mailbox == "archive"){
          y6.setAttribute("onclick", "archive(0, " + email.id + ");");
          y6.innerHTML = "Unarchive";
          y4.appendChild(y6);          
        }
        theDiv.appendChild(y4);
      }

      const y7 = document.createElement("hr");
      theDiv.appendChild(y7);
      const y8 = document.createElement("div");
      let b = email.body;
      // New lines in email body are ignored unless the \n escape sequences are replaced with "<br>":
      b = b.replace(/(?:\r\n|\r|\n)/g, '<br>');
      y8.innerHTML = b;
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
          read: 1
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
          let theDiv = document.getElementById('emails-view');
          let x = document.createElement("div");
          x.setAttribute("class", "row alert-primary");
          x.setAttribute("id", "header");
          if (mailbox == "sent") {
            x.innerHTML = '<div class="col-md-4">Recipient(s)</div><div  class="col-md-5">Subject</div><div class="col-md-3">Timestamp</div>';
          }
          else {
            x.innerHTML = '<div class="col-md-4">Sender</div><div  class="col-md-5">Subject</div><div class="col-md-3">Timestamp</div>';
          }
          
          theDiv.appendChild(x);

          for (let i = 0; i < emails.length; i++) {                    

            let y = document.createElement("div");
            y.setAttribute("class", "row email");
            y.setAttribute("onclick", "show_email(" + emails[i].id + ");");

            // Display emails that have been read with grey background
            if (emails[i].read) {
              y.setAttribute("class", "row email read");
            }

            let z = document.createElement("div");
            z.setAttribute("class", "col-md-4");
            if (mailbox == "sent") {
              e = emails[i].recipients.toString(); 
              e = e.replace(",", ", ");
              z.innerHTML = e;             
            }
            else {              
              z.innerHTML = emails[i].sender;
            }
        
            y.appendChild(z);
            let z1 = document.createElement("div");
            z1.setAttribute("class", "col-md-5");
            z1.innerHTML = emails[i].subject; 
            z.after(z1);
            let z2 = document.createElement("div");
            z2.setAttribute("class", "col-md-3");
            z2.innerHTML = emails[i].timestamp; 
            z1.after(z2);
            //let theDiv = document.getElementById('emails-view');
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

