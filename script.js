function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function await_loaded_video() {
    while (
        // While the video element is not loaded
        document.querySelector("#movie_player > div.html5-video-container > video") == null || 

        // Wile the width of the video element isn't specifically set in pixels
        window.getComputedStyle(document.querySelector("#movie_player > div.html5-video-container > video")).width.substring(
            window.getComputedStyle(document.querySelector("#movie_player > div.html5-video-container > video")).width.length-2
        ) != "px"
    ) {
        await sleep(100)
    }
}

window.onload = async function() {
    await await_loaded_video()

    console.log("LOADED")
};