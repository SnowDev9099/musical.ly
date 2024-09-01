const playFabTitleId = "496B7";
const githubRepo = "https://github.com/SnowDev9099/musical.ly-repo";
const githubToken = "YOUR_GITHUB_PERSONAL_ACCESS_TOKEN";

// PlayFab User Authentication
function signUp() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch(`https://YOUR_PLAYFAB_TITLE.playfabapi.com/Client/RegisterPlayFabUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            TitleId: playFabTitleId,
            Username: username,
            Password: password,
            RequireBothUsernameAndEmail: false
        })
    })
    .then(response => response.json())
    .then(data => console.log(data));
}

function logIn() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch(`https://YOUR_PLAYFAB_TITLE.playfabapi.com/Client/LoginWithPlayFab`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            TitleId: playFabTitleId,
            Username: username,
            Password: password
        })
    })
    .then(response => response.json())
    .then(data => console.log(data));
}

// GitHub Upload
async function uploadVideo() {
    const videoFile = document.getElementById('videoFile').files[0];
    const videoTitle = document.getElementById('videoTitle').value;
    const videoDescription = document.getElementById('videoDescription').value;

    const reader = new FileReader();
    reader.onloadend = async function() {
        const base64Video = reader.result.split(",")[1];

        const videoResponse = await fetch(`https://api.github.com/repos/${githubRepo}/contents/videos/${videoFile.name}`, {
            method: "PUT",
            headers: {
                "Authorization": `token ${githubToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: `Upload video: ${videoFile.name}`,
                content: base64Video
            })
        });

        const videoJson = {
            title: videoTitle,
            description: videoDescription,
            likes: 0
        };

        const jsonResponse = await fetch(`https://api.github.com/repos/${githubRepo}/contents/videos/${videoFile.name.split('.')[0]}.json`, {
            method: "PUT",
            headers: {
                "Authorization": `token ${githubToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: `Upload video metadata: ${videoFile.name.split('.')[0]}.json`,
                content: btoa(JSON.stringify(videoJson))
            })
        });

        console.log(videoResponse);
        console.log(jsonResponse);
    };

    reader.readAsDataURL(videoFile);
}

// Fetch and display videos
async function loadVideos() {
    const response = await fetch(`https://api.github.com/repos/${githubRepo}/contents/videos`, {
        headers: { "Authorization": `token ${githubToken}` }
    });
    const files = await response.json();

    files.forEach(file => {
        if (file.name.endsWith('.mp4')) {
            const videoUrl = `https://raw.githubusercontent.com/${githubRepo}/main/videos/${file.name}`;
            const jsonUrl = `https://raw.githubusercontent.com/${githubRepo}/main/videos/${file.name.split('.')[0]}.json`;

            fetch(jsonUrl)
                .then(res => res.json())
                .then(data => {
                    document.getElementById('video-feed').innerHTML += `
                        <video controls src="${videoUrl}"></video>
                        <h2>${data.title}</h2>
                        <p>${data.description}</p>
                        <p>Likes: ${data.likes}</p>
                        <button onclick="likeVideo('${file.name.split('.')[0]}')">Like</button>
                    `;
                });
        }
    });
}

// Like a video
async function likeVideo(videoName) {
    const jsonUrl = `https://raw.githubusercontent.com/${githubRepo}/main/videos/${videoName}.json`;

    const response = await fetch(jsonUrl);
    const videoData = await response.json();
    videoData.likes += 1;

    const updatedJson = btoa(JSON.stringify(videoData));

    await fetch(`https://api.github.com/repos/${githubRepo}/contents/videos/${videoName}.json`, {
        method: "PUT",
        headers: {
            "Authorization": `token ${githubToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: `Update likes for ${videoName}.json`,
            content: updatedJson
        })
    });

    alert("Video liked!");
}

loadVideos();
