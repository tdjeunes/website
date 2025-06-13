class ListFacet extends Facet {

  postProcess(raw) {
    if (!raw.startsWith('(')) {
      return [];
    }
    if (!raw.endsWith(')')) {
      return [];
    }
    return raw
      .substring(1, raw.length - 1)
      .split(')(');
  }

  armFacetController(onChangeCallback) {
    const that = this;
    $('.my-facet-not-new-page[data-facet=' + this.id() + ']').off().on('click', function(e) {
      e.preventDefault();
      that.toggleAndRemoveOthers(
        that.s('textUtilities').strFromUriEncoded($( this ).attr('data-add-category')),
      );
      onChangeCallback();
    });
    $('.my-facet-new-page[data-facet=' + this.id() + ']').each(function() {
      $( this ).attr(
        'href',
        '/actualites/#' + that.id() + '/(' + that.s('textUtilities').strFromUriEncoded($( this ).attr('data-add-category')).toUriEncodedAndSanitized() + ')',
      );
    });
  }

  addSanitized(value) {
    if (!this._value.includes(value)) {
      this._value.push(value);
    }
  }

  addBadges(filtered) {
    const info = this.getBadgeInfo(filtered);

    $('.my-category[data-facet=' + this.id() + ']').each(function() {
      const value = decodeURI($( this ).attr('data-add-category'))
        .replace(/\+/g, " ");;
      const count = typeof info[value] !== 'undefined' ? info[value] : 0;
      const disabled = count === 0 ? true : false;
      $( this ).find('.badge').text(count).show();
      if (disabled) {
        $( this ).addClass('my-disabled');
      }
    });
  }

  getBadgeInfo(filtered) {
    let ret = {};

    for (const article of filtered) {
      const articleValues = article.getFacetValues(this.id());
      for (const value of articleValues) {
        if (!ret[value]) {
          ret[value] = 0;
        }
        ret[value]++;
      }
    }

    return ret;
  }

  putInButtons(filtered) {
    const that = this;

    this.addBadges(filtered);

    if (!that._value.length) {
      $('.my-category[data-facet=' + that.id() + ']').removeClass('my-selected');
    }

    $('.my-category').each(function() {
      if ($( this ).attr('data-facet') == that.id()) {
        const category = $( this ).attr('data-add-category');
        const decoded = decodeURI(category);
        for (const value of that._value) {
          const sVal = that.s('textUtilities').sanitizeString(value);
          const sCat = that.s('textUtilities').sanitizeString(decoded);
          console.log('1534', sVal, sCat);
          if (sVal == sCat) {
            $( this ).addClass('my-selected');
          }
          else {
            $( this ).removeClass('my-selected');
          }
        }
      }
    });
  }

  removeSanitized(value) {
    // https://stackoverflow.com/a/66956107/1207752
    this._value.includes(value) && this._value.splice(this._value.indexOf(value), 1);
  }

  preprocessHashValue(value) {
    let sanitized = [];

    for (const unsanitized of value) {
      const sanitizedValue = this.s('textUtilities').sanitizeString(decodeURI(unsanitized));
      if (sanitizedValue) {
        sanitized.push(decodeURI(sanitizedValue));
      }
    }

    return '(' + sanitized.join(')(') + ')';
  }

}
