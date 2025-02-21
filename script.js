let isResizing = false;
let startX;
let startWidth;

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

function inject_resizer_element(parent) {
    let resizer_element_div = document.createElement("div")
    resizer_element_div.id = "resizer-element"
    parent.appendChild(resizer_element_div)
}

window.onload = async function() {
    // Wait for the page to be fully loaded
    await await_loaded_video()

    // Get all necesary elements
    let video_element = document.querySelector("#movie_player > div.html5-video-container > video")
    let container_element = document.querySelector("#movie_player")
    let bottom_bar = document.querySelector("#movie_player > div.ytp-chrome-bottom")
    let side_content = document.querySelector("#secondary")
    let bottom_content = document.querySelector("#below")
    let player_element = document.querySelector("#player")

    let elements_to_resize = [
        document.querySelector("#movie_player > div.html5-video-container > video"),
        document.querySelector("#movie_player > div.html5-video-container"),
        document.querySelector("#movie_player"),
        document.querySelector("#container"),
        document.querySelector("#ytd-player"),
        document.querySelector("#player-container"),
        document.querySelector("#player-container-inner"),
        document.querySelector("#player-container-outer")
    ]

    // Get all necesary values
    let min_video_width = Number(window.getComputedStyle(video_element).width.slice(0, -2))

    // Inject the resizer element
    inject_resizer_element(container_element)
    let resizer_element = document.querySelector("#resizer-element")

    // Get the video width:height ratio
    width_height_ratio = Number(video_element.style.width.slice(0, -2)) / Number(video_element.style.height.slice(0, -2))
    console.log("WHR:", width_height_ratio)

    // Remove the side content
    side_content.parentNode.removeChild(side_content)
    // Adjust the elements to the new size
    resize_elements( Number(window.getComputedStyle(container_element).width.slice(0, -2)) )

    // Implement the resizing
    resizer_element.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = video_element.offsetWidth;
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    });

    function resize_elements(width) {
        if (width < min_video_width) {width = min_video_width}

        let height = Math.floor( width / width_height_ratio )

        for (let el of elements_to_resize) {
            el.style.width = width + 'px';
            el.style.height = height + 'px';
        }

        position_bottom_elements()
        position_bottom_bar()
    }
      
    function resize(e) {
        if (!isResizing) return;

        let width = startWidth + (e.clientX - startX);
        resize_elements(width)
    }
      
    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }

    function position_bottom_elements() {
        let top_value = player_element.offsetTop + player_element.offsetHeight + 10
        bottom_content.style.top = `${top_value}px`
    }

    function position_bottom_bar() {
        let bottom_bar_width = bottom_bar.offsetWidth
        let video_player_width = player_element.offsetWidth
        
        let bottom_bar_left_value = Math.floor( ( video_player_width - bottom_bar_width ) / 2 )

        bottom_bar.style.left = `${bottom_bar_left_value}px`
    }
};