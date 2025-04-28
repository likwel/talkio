function showRealMessage(div, content, time) {
    const message = `
        <div class="message message-out">
            <div class="message-inner">
                <div class="message-body">
                <div class="message-content">
                    <div class="message-text py-2 px-4">
                    <p>${content}</p>
                    
                    </div>
                </div>
                <div class="message-footer">
                    <span class="extra-small text-muted">
                        ${time}
                    </span>
                    <small class="ms-2 float-end ">
                        <svg width="15" fill="#000000" viewBox="0 0 24 24" id="check-double" data-name="Flat Line" xmlns="http://www.w3.org/2000/svg" class="icon flat-line"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><line id="primary" x1="13.22" y1="16.5" x2="21" y2="7.5" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line><polyline id="primary-2" data-name="primary" points="3 11.88 7 16.5 14.78 7.5" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></polyline></g></svg>
                    </small>
                </div>
                </div>
            </div>
        </div>
    `

    div.innerHTML += message

}

function showOtherMessage(div, content, time, user) {

    const avatarHtml = user.photo
        ? `<img class="avatar-img" src="/img/avatars/${user.photo}" alt="${user.username}">`
        : `
        <div class="avatar avatar-online" title="${user.username}">
        <span class="avatar-text" style="background:${user.avatarColor};">
            ${user.username.charAt(0).toUpperCase()}
        </span>
        </div>
    `;

    const message = `
        <div class="message align-items-start">
            <a href="#" class="avatar avatar-responsive " data-bs-toggle="modal" data-bs-target="#modal-user-profile">
                ${avatarHtml}
            </a>

            <div class="message-inner">
                <div class="message-body">
                <div class="message-content">
                    <div class="message-text py-2 px-4">
                    <p>${content}</p>
                    
                    </div>
                </div>
                <div class="message-footer">
                    <span class="extra-small text-muted">
                        ${time}
                    </span>
                </div>
                </div>
            </div>
        </div>
    `

    div.innerHTML += message
}

let createGroupChat = document.querySelector("#createGroupChat")
let floatingInput = document.querySelector("#floatingInput")


if (createGroupChat) {
    createGroupChat.addEventListener("click", () => {

        const name = floatingInput.value.trim()

        const checkedUsers = [...document.querySelectorAll("#create-chat-members input[type='checkbox']:checked")]
            .map(cb => cb.getAttribute("data-value"));
        console.log(checkedUsers)

        if (name && checkedUsers.length) {
            createGroup(name, checkedUsers);
        } else {
            alert("Veuillez entrer un nom et sélectionner des membres.");
        }

    })
}


function createGroup(name, usersId = []) {
    fetch('/chat/group/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: name,
            participantIds: usersId // id des membres du groupe
        })
    }).then(r => r.json())
        .then(res => {
            alert('Groupe créé avec succès ✅');
            floatingInput.value = ''

            console.log('Groupe créé :', res);
            window.location.href = '/chat/group/' + res.id
        })

}