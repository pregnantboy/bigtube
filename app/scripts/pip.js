function percentageOfVideoInViewport(video) {
  const viewportHeight = window.innerHeight
  const boundingRect = video.getBoundingClientRect()
  const elementOffsetTop = boundingRect.top
  const elementOffsetBottom = viewportHeight - boundingRect.bottom
  const elementHeight = boundingRect.height

  if (elementOffsetTop <= 0) {
    if (elementOffsetTop + elementHeight <= 0) {
      return 0
    } else {
      return (
        (Math.min(elementOffsetTop + elementHeight, viewportHeight) /
          Math.min(elementHeight, viewportHeight)) *
        100
      )
    }
  } else {
    if (elementOffsetTop > viewportHeight) {
      return 0
    } else {
      return (
        ((viewportHeight -
          elementOffsetTop -
          Math.max(elementOffsetBottom, 0)) /
          Math.min(elementHeight, viewportHeight)) *
        100
      )
    }
  }
}

function pip() {
  const videos = Array.from(document.querySelectorAll('video'))

  if (!videos.length) {
    return
  }

  let video = videos[0]

  if (videos.length > 1) {
    videos.sort(function (a, b) {
      const difference =
        percentageOfVideoInViewport(b) - percentageOfVideoInViewport(a)

      if (difference !== 0) {
        return difference
      } else {
        return b.clientHeight * b.clientWidth - a.clientHeight * a.clientWidth
      }
    })
    video = videos[0]
  }

  if (video.disablePictureInPicture) {
    video.disablePictureInPicture = false
  }

  if (document.pictureInPictureElement === video) {
    try {
      document.exitPictureInPicture()
    } catch (e) {
      console.error(e)
    }
    return
  }

  try {
    video.requestPictureInPicture()
  } catch (e) {
    console.log(e)
  }
}

pip()
