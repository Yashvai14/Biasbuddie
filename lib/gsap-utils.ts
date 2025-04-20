import gsap from "gsap"

// Fade in animation
export const fadeIn = (element: string | Element, delay = 0, duration = 0.8) => {
  return gsap.fromTo(
    element,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease: "power3.out",
    },
  )
}

// Fade out animation
export const fadeOut = (element: string | Element, delay = 0, duration = 0.8) => {
  return gsap.to(element, {
    opacity: 0,
    y: -20,
    duration,
    delay,
    ease: "power3.out",
  })
}

// Scale in animation
export const scaleIn = (element: string | Element, delay = 0, duration = 1) => {
  return gsap.fromTo(
    element,
    { opacity: 0, scale: 0.8 },
    {
      opacity: 1,
      scale: 1,
      duration,
      delay,
      ease: "elastic.out(1, 0.5)",
    },
  )
}

// Stagger animation for multiple elements
export const staggerElements = (elements: string | Element, staggerTime = 0.1, delay = 0) => {
  return gsap.fromTo(
    elements,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: staggerTime,
      delay,
      ease: "power3.out",
    },
  )
}

// Scroll trigger animation
export const scrollTriggerAnimation = (
  element: string | Element,
  animation: "fadeIn" | "scaleIn" | "slideIn" = "fadeIn",
  triggerPosition = "top 80%",
) => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: element,
      start: triggerPosition,
    },
  })

  switch (animation) {
    case "fadeIn":
      tl.fromTo(element, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
      break
    case "scaleIn":
      tl.fromTo(element, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1, ease: "back.out(1.7)" })
      break
    case "slideIn":
      tl.fromTo(element, { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" })
      break
  }

  return tl
}

// Text reveal animation
export const textReveal = (element: string | Element) => {
  const text = document.querySelector(element as string)
  if (!text) return

  const content = text.textContent || ""
  text.textContent = ""

  const characters = content.split("")
  characters.forEach((char) => {
    const span = document.createElement("span")
    span.textContent = char
    span.style.opacity = "0"
    text.appendChild(span)
  })

  gsap.to(`${element} span`, {
    opacity: 1,
    stagger: 0.03,
    duration: 0.1,
    ease: "power3.out",
  })
}
