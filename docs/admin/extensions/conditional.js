// Show or hide fields conditionally.
// Example:- If User selects accordian from structure field in a section.
// we are fetching types json and get accordion object from types.
//
//  {
//   "type": "accordion",
//   "requires": [
//     {
//       "label": "parts",
//       "id": "_parts"
//     }
//   ]
// }
//
// Accordian requires parts field . we are displaying parts field and hidding
// all other fields inside the section.
//
// if selected value from structure not found in types then we are
// displaying all the fields

class ConditionalFieldChecker {
  run() {
    const that = this;

    // In new page no structure selected hence hide all fields initially.
    this.hideAllFieldsInNewPage();

    // Attach the click listener for selecting options new page.
    // On change in structure dropdown, Get selected structure value
    // and display the fields based on types json.
    // ex:- if selected structure value is only text then fields with onlytext
    // is filtered from types and we will know which field to be displayed.
    this.attachOptionClickListener();

    // Attach the click event listener for the dynamic ListItem element in edit page.
    // In edit page if already sections with structure dropdown field value available then
    // we have to get that structure value and show or hide fields accordingly.
    this.attachDynamicTopBarButtonClickListener();

  }

  // In new page or when user clicks on add section
  // no structure selected hence hide all fields initially.
  hideAllFieldsInNewPage() {
    $(document).on('click', '.css-cutcix-AddButton-button-widget', function () {
      // Delay 30ms to wait for DOM updates
      setTimeout(function () {
        const lastItem = $('[class*="css-"][class*="ListItem-listControlItem-ListControl"]').last();

        if (lastItem.length === 0) return;

        const singleValue = lastItem.find('[class*="css-"][class*="singleValue"]').first();

        if (singleValue.length) {
          console.log("Found singleValue:", singleValue.text());
        } else {
          const label = lastItem.find('label[for^="structure-field-"]').first();

          if (label.length) {
            const controlContainer = label.closest('[class*="css-"][class*="ControlContainer"]');

            if (controlContainer.length) {
              controlContainer.siblings('[class*="css-"][class*="ControlContainer"]').hide();
            }
          }
        }
      }, 30); // 30 milliseconds delay
    });
  }

  // attach the click event listener for option selection
  attachOptionClickListener() {
    const that = this;
    $(document).on('click', '[class*="css-"][class*="option"]', function() {
      const selectedLabel = $(this).text();

      // remove space, "and" and - and replace with space.
      const formattedLabel = that.formatLabel(selectedLabel);

      // Get the parent div which is a wrapper of all fields inside section.

      // Get structure field parent element.
      const structureContainer = this.closest('div[class*="-ControlContainer"]');
      const parentDiv = that.getParentDiv(structureContainer);

      that.handleFieldVisibility(formattedLabel, structureContainer, parentDiv);
    });
  }

  // Get require from types json based on selected structure field value.
  // If require object is found then show the required field and hide other.
  handleFieldVisibility(formattedLabel, structureContainer, parentDiv) {
    const foundRequires = this.getRequiresByType(formattedLabel);

    if (foundRequires) {
      this.toggleControlContainerSiblings(structureContainer, 'none');
      this.showHideFieldsVisibility(foundRequires, parentDiv);
    } else {
      this.toggleControlContainerSiblings(structureContainer, 'revert');
    }
  }

  // Function to get requires from types json
  getRequiresByType(typeName) {
    // First try finding the type as-is
    let foundType = types.find(item => item.type === typeName);

    // If not found, try removing underscores and search again
    if (!foundType) {
      const cleanedTypeName = typeName.replace(/_+/g, '');
      foundType = types.find(item => item.type === cleanedTypeName);

      if (!foundType) {
        console.log(`Type '${typeName}' (or '${cleanedTypeName}') not found.`);
        return null;
      }
    }

    if (!Array.isArray(foundType.requires) || foundType.requires.length === 0) {
      console.log(`Type '${typeName}' has no requirements.`);
      return null;
    }

    return foundType.requires;
  }

  // Method to loop through each required field, try to find the label first then wrapper
  // of the field and Show that field.
  // Suppose if you want to show parts field then we have to get label element having
  // attribute for^="parts-field-*. (* is a field number) and then label and input field
  // parent ControlContainer and show that field.
  showHideFieldsVisibility(requires, parentDiv) {
    requires.forEach(req => {

      const labelText = req.label.trim();
      let lookfor = 'label[for^="'+labelText+'-field-"]';

      // Wrap in jQuery in case it's not already
      const $parentDiv = $(parentDiv);

      if ($parentDiv.length) {
        console.log("parentDiv:", $parentDiv);
        const $label = $parentDiv.find(lookfor);

        if ($label.length) {
          const $controlContainer = $label.closest('div[class*="ControlContainer"]');

          if ($controlContainer.length) {
            $controlContainer.css('display', 'revert');
            console.log("Display set to revert on:", $controlContainer);
          } else {
            console.log("ControlContainer div not found.");
          }
        } else {
          console.log(lookfor + " not found.");
        }
      } else {
        console.log("Parent div not found.");
      }
    });
  }

  // Show or hide the fields which are rendered after structure field.
  toggleControlContainerSiblings(structureContainer, displayValue) {

    if (!structureContainer) {
      console.log("structureContainer not found.");
      return;
    }

    let sibling = structureContainer.nextElementSibling;
    while (sibling) {
      if (sibling.matches('div[class*="-ControlContainer"]')) {
        sibling.style.display = displayValue;
      }
      sibling = sibling.nextElementSibling;
    }
  }

  // Method to format the label (convert to lowercase, remove spaces, remove "and".)
  formatLabel(selectedLabel) {
    let formattedLabel = selectedLabel.toLowerCase().replace(/\s+/g, '_');
    formattedLabel = formattedLabel.replace(/and/g, '').trim();
    formattedLabel = formattedLabel.replace(/__+/g, '_');
    return formattedLabel;
  }

  // Method to find the parent div which is a wrapper of all fields inside section.
  getParentDiv(element) {
    return $(element).parent().parent();
  }

  // Handle show or hide field in edit page.
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

    // Find the initially selected label inside the parent div element
    const initialSelectedLabel = parentDiv.find('[class*="css-"][class*="singleValue"]').text();
    if (initialSelectedLabel) {
      const formattedLabel = that.formatLabel(initialSelectedLabel);
      const structureContainer = parentDiv
      .find('[class*="css-"][class*="singleValue"]')
      .closest('div[class*="-ControlContainer"]');

      // convert jquery output to DOM
      const structureContainerDOM = structureContainer.get(0);
      that.handleFieldVisibility(formattedLabel, structureContainerDOM, parentDiv);
    }
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
