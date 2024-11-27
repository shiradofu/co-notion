clear-unused-images:
	@ls ./dist/assets/*.webp \
		| xargs -I{} basename "{}" \
		| xargs -I{} sh -c '\
			if ! grep -rq "{}" src/i18n/*; then \
				echo "rm {}" && rm "./dist/assets/{}"; \
			fi \
			'
