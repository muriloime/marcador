module Marcador
  class HighlightsController < ApplicationController
    def index
      render json: { all_highlights: [] }
    end
    
    def create
      
    end
  end
end
