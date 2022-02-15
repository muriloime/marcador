Marcador::Engine.routes.draw do
  resources :highlights, only: ['index', 'create', 'destroy']
end
