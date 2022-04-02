module Marcador
  class InstallGenerator < Rails::Generators::Base
    source_root File.expand_path(__dir__)

    # def pin_js
    #   say "Create controllers directory"
    #   append_to_file "config/importmap.rb" do <<-RUBY
    #   pin "@marcador/stimulus", to: "stimulus.min.js", preload: true
    #   pin "@hotwired/stimulus-loading", to: "stimulus-loading.js", preload: true
    #   pin_all_from "app/javascript/controllers", under: "controllers"
    #   RUBY
    #   end
    # end

    def add_manifest
      say 'Adding manifest', :green
      append_file 'app/assets/config/manifest.js', "\n//= link marcador_manifest.js\n"
    end

    def mount_routes
      inject_into_file 'config/routes.rb', before: /^end$/ do
        "  mount Marcador::Engine => '/', as: 'marcador'\n"
      end
    end
  end
end
