model_provider = "deepseek"
model = "deepseek-v4-flash[1m]"

model_context_window = 1000000
model_auto_compact_token_limit = 900000
[model_providers.deepseek]
name = "DeepSeek"
base_url = "http://127.0.0.1:3000/v1"