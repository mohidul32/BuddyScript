document.addEventListener("DOMContentLoaded", function() {
  const toggleMode = document.querySelector("._layout_swithing_btn_link");
  const layout = document.querySelector("._layout_main_wrapper");
  let darkMode = false;

  if(toggleMode) {  // null check
    toggleMode.addEventListener("click", () => {
      darkMode = !darkMode;
      if(darkMode){
        layout.classList.add("_dark_wrapper");
      } else {
        layout.classList.remove("_dark_wrapper");
      }
    });
  }

  // Profile dropdown
  const profileDropdown = document.querySelector("#_prfoile_drop");
  const profileDropShowBtn = document.querySelector("#_profile_drop_show_btn");
  let isDropShow = false;

  if(profileDropShowBtn && profileDropdown) {
    profileDropShowBtn.addEventListener("click", function() {
      isDropShow = !isDropShow;
      if(isDropShow){
        profileDropdown.classList.add('show');
      } else {
        profileDropdown.classList.remove('show');
      }
    });
  }

  // Timeline dropdown
  const timelineDropdown = document.querySelector("#_timeline_drop");
  const timelineDropShowBtn = document.querySelector("#_timeline_show_drop_btn");
  let isDropTimelineShow = false;

  if(timelineDropShowBtn && timelineDropdown) {
    timelineDropShowBtn.addEventListener("click", function() {
      isDropTimelineShow = !isDropTimelineShow;
      if(isDropTimelineShow) {
        timelineDropdown.classList.add('show');
      } else {
        timelineDropdown.classList.remove('show');
      }
    });
  }
});
