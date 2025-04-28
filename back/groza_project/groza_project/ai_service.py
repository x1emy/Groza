from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt

# Вот тут пишем функцию прямо здесь:
def generate_list(prompt):
    # Пример генерации списка — здесь может быть вызов ИИ
    return [f"Item {i+1} based on prompt: {prompt}" for i in range(5)]

@csrf_exempt
@api_view(['POST'])
def generate_ai_list(request):
    try:
        if not request.data or 'prompt' not in request.data:
            return Response(
                {"error": "Prompt is required"},
                status=status.HTTP_400_BAD_REQUEST,
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:4200",
                    "Access-Control-Allow-Credentials": "true"
                }
            )

        prompt = request.data['prompt'].strip()
        items = generate_list(prompt)

        response = Response({
            "items": items,
            "model": "chatglm3-6b",
            "source": "local"
        })
        response["Access-Control-Allow-Origin"] = "http://localhost:4200"
        response["Access-Control-Allow-Credentials"] = "true"
        return response

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            headers={
                "Access-Control-Allow-Origin": "http://localhost:4200",
                "Access-Control-Allow-Credentials": "true"
            }
        )
