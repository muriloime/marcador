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
      append_file 'app/assets/config/manifest.js' do <<-RUBY
        //= link ff/manifest.js
      RUBY
    end

    def copy_locales
      say 'Copying locales folder', :green
      directory '../../../config/ff_core/locales', 'config/locales'
    end
  end
end
