// // function foo(x?: number | string | null) {
// //   if (!x) {
// //     x;
// //   }
// // }

// interface UploadEvent {
//   type: "upload";
//   filename: string;
//   contents: string;
// }
// interface DownloadEvent {
//   type: "download";
//   filename: string;
// }

// type AppEvent = UploadEvent | DownloadEvent;

// function handleEvent(e: AppEvent) {
//   switch (e.type) {
//     case "download":
//       e;
//       break;
//     case "upload":
//       e;
//       break;
//   }
// }

function isInputElement(el: HTMLElement): el is HTMLInputElement {
  return "value" in el;
}

function getElementContent(el: HTMLElement) {
  if (isInputElement(el)) {
    el;
    return el.value;
  }
  el;
  return el.textContent;
}
