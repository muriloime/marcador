module Marcador
  class HighlightsController < ApplicationController
    def index
      render json: { highlights: query.enrich_highlights(highlighter_user) }
    end

    def create
      render json: { highlights: show_highlights }
    end

    def destroy
      render json: { highlights: remove_highlights }
    end

    private

    def show_highlights
      if highlightable.present? && Highlight.can_add_highlights?(highlightable, highlighter_user)
        highlight = query.new(highlight_params.merge({ column: column }))
        highlight.save
        query.enrich_highlights(highlighter_user)
      else
        []
      end
    end

    def remove_highlights
      if highlight.present? && can_destroy?
        highlight.destroy
        highlightable.highlights.where(id: params[:id]).enrich_highlights(highlighter_user).as_json
      else
        []
      end
    end

    def can_destroy?
      highlight.respond_to?(:can_remove_highlight?) ? highlight.can_remove_highlight?(highlighter_user) : (highlight.user == highlighter_user)
    end

    def highlight
      @highlight ||= highlightable.highlights.where(id: params[:id]).first
    end

    def query
      Highlight.where(highlightable: highlightable, user: highlighter_user)
    end

    def highlight_params
      params.permit(:container_node_type,
                    :container_node_identifier_key,
                    :container_node_identifier,
                    :startnode_offset,
                    :endnode_offset,
                    :selection_backward,
                    :content,
                    :highlightable_type,
                    :highlightable_id)
    end

    def highlightable
      @highlightable ||= begin
        highlightable_model = params[:highlightable_type].to_s.constantize
        highlightable_model.respond_to?(:find_by_id) && highlightable_model.find_by_id(params[:highlightable_id])
      end
    end

    def highlighter_user
      @highlighter_user ||= (respond_to?(:current_user) && current_user) || (respond_to?(
        :current_resource_owner, true
      ) && send(:current_resource_owner)) || nil
    end

    def column
      if params[:column].blank? && highlightable.highlightable_columns.size > 1
        raise ArgumentError, 'More than one highlightable column found. Please provide column in your parameters'
      elsif params[:column].blank?
        highlightable.highlightable_columns.first.to_s
      else
        params[:highlightable_column].to_s
      end
      # if !highlightable.respond_to?(:highlightable_columns)
      #   raise ArgumentError.new("Highlightable column not found. Please check the parameter: column")
      # end
      # if !highlightable.highlightable_columns.include? @column
      #   raise ArgumentError.new("Invalid Highlightable column")
      # end
    end
  end
end
