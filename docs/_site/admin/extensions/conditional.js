class ConditionalFieldChecker {
  run() {
    const that = this;

    // Attach the click listener for selecting options new page.
    // On change in structure dropdown select value we are fetching selected structure value
    // and displaying the fields based on hints of the field.
    // ex:- if selected structure value is breadcrumb then fields with hint
    // hint: 'Breadcrumbs [only:breadcrumb]' are only field visible.
    this.attachOptionClickListener();

    // Attach the click event listener for the dynamic ListItem element in edit page.
    // In edit page if already sections with structure dropdown field value available then
    // we have to get that structure value and show or hide fields accordingly.
    this.attachDynamicTopBarButtonClickListener();

  }

  // Method to check if the condition is met for a hint based on field value
  isConditionMet(fieldValue, condition) {
    const conditions = condition.split(';');
    return conditions.includes(fieldValue);  // Simplified, can be expanded
  }

  // Refactored method to attach the click event listener for option selection
  attachOptionClickListener() {
    const that = this;
    $(document).on('click', '[class*="css-"][class*="option"]', function() {
      const selectedLabel = $(this).text();
      const formattedLabel = that.formatLabel(selectedLabel);

      // Get the parent div and hints
      const parentDiv = that.getParentDiv(this);
      const hints = that.getHints(parentDiv);

      // Loop through each hint to update its visibility based on the formatted label
      that.updateHintsVisibilityBasedOnLabel(hints, formattedLabel);
    });
  }

  // Method to format the label (convert to lowercase, replace spaces, remove "and", etc.)
  formatLabel(selectedLabel) {
    let formattedLabel = selectedLabel.toLowerCase().replace(/\s+/g, '_');
    formattedLabel = formattedLabel.replace(/and/g, '').trim();
    formattedLabel = formattedLabel.replace(/__+/g, '_');
    return formattedLabel;
  }

  // Method to find the parent div that contains the selected option
  getParentDiv(optionElement) {
    return $(optionElement).closest('div[class*="css-1cjg468"]');
  }

  // Method to get the hints within the parent div
  getHints(parentDiv) {
    return parentDiv.find('[class*="ControlHint"]');
  }

  // Method to loop through each hint and update its visibility based on the formatted label
  updateHintsVisibilityBasedOnLabel(hints, formattedLabel) {
    hints.each(function() {
      const hintText = $(this).text();  // Get the hint text
      if (hintText.includes(formattedLabel)) {
          // If the formatted label is within the hint, show its parent div
          $(this).closest('.css-1rsca1y-ControlContainer').show();
      } else {
          // If the formatted label is NOT in the hint, hide its parent div
          $(this).closest('.css-1rsca1y-ControlContainer').hide();
      }
    });
  }

  attachDynamicTopBarButtonClickListener() {
    const that = this;

    // Attach the click listener to the TopBarButton button
    $(document).on('click', '[class*="css-"][class*="TopBarButton-button"]', function() {
      const button = $(this);

      // Check if the TopBarButton is currently collapsed or uncollapsed
      if (that.isTopBarButtonUncollapsed(button)) {
        // If uncollapsed, process the click and find the correct parent div
        that.processTopBarButtonClick(button, 'uncollapsed');
      } else {
        // If collapsed, process the click and find the correct parent div
        that.processTopBarButtonClick(button, 'collapsed');
      }
    });
  }

  // Check if the TopBarButton is uncollapsed
  isTopBarButtonUncollapsed(button) {
    // Check for a change in the class that indicates if the button is uncollapsed
    return button.closest('div[class*="ListItem-listControlItem-ListControl"]').hasClass('ListControl');
    // This checks if it has a class like 'ListControl' (adjust based on your actual logic)
  }

  // Process the TopBarButton click (find parent div and other elements) based on its state
  processTopBarButtonClick(button, state) {
    const that = this;

    // Based on the state (collapsed or uncollapsed), find the appropriate parent div
    const parentDiv = that.getParentDivByState(button, state);

    // Find the initial selected label inside the parent div
    const initialSelectedLabel = parentDiv.find('[class*="css-"][class*="singleValue"]').text();

    // Now, get the hints within the parent div
    const hints = that.getHints(parentDiv);
    const formattedLabel = that.formatLabel(initialSelectedLabel);

    that.updateHintsVisibilityBasedOnLabel(hints, formattedLabel);

  }

  // Method to find the correct parent div based on the collapsed/uncollapsed state
  getParentDivByState(button, state) {
    const that = this;
    let parentDiv;

    // When uncollapsed, find the div with the dynamic class like css-1z13ucf-ListItem-listControlItem-ListControl
    if (state === 'uncollapsed') {
      parentDiv = button.closest('div[class*="css-"][class*="ListItem-listControlItem-ListControl"]');
    }
    // When collapsed, find the div with the dynamic class like css-6yrbby-ListItem-listControlItem-listControlItemCollapsed-ListControl
    else if (state === 'collapsed') {
      parentDiv = button.closest('div[class*="css-"][class*="ListItem-listControlItem-listControlItemCollapsed-ListControl"]');
    }

    return parentDiv;
  }

}

$(document).ready(function () {
  (new ConditionalFieldChecker()).run();
});
