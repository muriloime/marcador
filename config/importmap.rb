
pin "@hotwired/stimulus", to: "stimulus.min.js" , preload: true
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js", preload: true
pin "rangy", to: "https://ga.jspm.io/npm:rangy@1.3.0/lib/rangy-core.js"
pin "rangy-classapplier", to: "https://ga.jspm.io/npm:rangy@1.3.0/lib/rangy-classapplier.js"
pin "@rails/request.js", to: "https://ga.jspm.io/npm:@rails/request.js@0.0.6/src/index.js"

# marcador entrypoint
# pin "marcador/application", preload: true
pin "application", to: "marcador/application.js", preload: true


pin_all_from Marcador::Engine.root.join("app/assets/javascripts/marcador/controllers"), under: "controllers", to: "marcador/controllers"
