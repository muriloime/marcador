# Marcador

Engine to make text highlights with persistence (like in medium.com) easy and configurable.

This gem is highly inspired by [acts_as_content_highlightable](https://github.com/kbravi/acts_as_content_highlightable), but using a more modern approach ( importmap, es6, migrations on engine, etc).

## Usage

Add `highlights_on :column_name` to the desired model. 
Add the reading controller to your view: 
```
<div data-controller="reading" data-reading-type="<%= @summary.class%>" data-reading-id="<%= @summary.id%>">
  <div data-reading-target="highlightable">
    <%== @summary.content %>
  </div>
</div>
```

## Installation
Add this line to your application's Gemfile:

```ruby
gem "marcador"
```

And then execute:
```bash
$ bundle
```

Or install it yourself as:
```bash
$ gem install marcador
```

## Contributing
Contribution directions go here.

## License
The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
