---
---
All carousel items for debugging:

{% assign sorted = (site.categories.jekyll_carousel | sort: 'order') %}
{% for carousel in sorted %}
<div>
  <img src="{{ carousel.image }}" style="max-width: 200px;" />
  <div>title: {{ carousel.title }}</div>
  <div>active: {{ carousel.active }}</div>
  <div>order: {{ carousel.order }}</div>
  <div>lien: {{ carousel.lien }}</div>
  <div>position: {{ carousel.position }}</div>
</div>
{% endfor %}
