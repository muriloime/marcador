
pin "@hotwired/stimulus", to: "stimulus.min.js" , preload: true
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js", preload: true
pin "rangy", to: "https://ga.jspm.io/npm:rangy@1.3.0/lib/rangy-core.js"

# marcador entrypoint
# pin "marcador/application", preload: true
pin "application", to: "marcador/application.js", preload: true


pin_all_from Marcador::Engine.root.join("app/assets/javascripts/marcador/controllers"), under: "controllers", to: "marcador/controllers"
