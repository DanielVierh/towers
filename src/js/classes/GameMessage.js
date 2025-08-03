export class GameMessage {
    constructor(title, message, type) {
        this.title = title;
        this.message = message;
        this.type = type;
    }

    show_Message() {
        
        let message_body = document.createElement('div');
        message_body.classList.add('message-body');

        let message_title = document.createElement('h2');
        message_title.innerText = this.title;


        let message_text = document.createElement('p');
        message_text.innerText = this.message;


        message_body.appendChild(message_title);
        message_body.appendChild(message_text);


        if (this.type === 'error') {
            message_body.classList.add('error');
        } else if (this.type === 'success') {
            message_body.classList.add('success');
        } else if (this.type === 'info') {
            message_body.classList.add('info');
        }

        //* Add message to body
        document.body.appendChild(message_body);

        //* Remove message from body
        setTimeout(() => {
            document.body.removeChild(message_body);
        }, 2000);
    }
    
}