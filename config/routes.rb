Marcador::Engine.routes.draw do
  resources :highlights, only: %w[index create destroy]
end
