import json
import os

# import subprocess
# import sys
# def install(package):
#     subprocess.check_call([sys.executable, "-m", "pip", "install", package])
#
# install('pydantic')
# install('openai')
# install('monkey-patch.py')

# pydantic and typing
from typing import Literal, Annotated
from pydantic import Field, BaseModel

# serverless
from http.server import BaseHTTPRequestHandler

# OpenAI
import openai
openai.api_key = os.getenv("OPENAI_API_KEY") # Your OpenAI API key
print("Here is the current key", os.getenv("OPENAI_API_KEY"))

# ********** Monkey Patching **********
from monkey_patch.monkey import Monkey


class DateString(BaseModel):
    date: str = Field(..., description="Date in the format YYYY-MM-DD")

class RelationshipType(BaseModel):
    relationship: Literal['couple', 'friends', 'family', 'solo'] = Field(..., description="The relationship of the people going on the trip")

class DayPlan(BaseModel):
    plan: str = Field(..., description="The plan for that day")




# The entire definition is its docstring, nothing else is needed
@Monkey.patch
def trip_planner(start_date:DateString, end_date:DateString, relationship:RelationshipType, people_count:Annotated[int, Field(gt=1, lt=10)], destination:str, requests:str ) -> list[DayPlan]:
    """
    Plan a trip to the provided destination, appropriate for the relationship and number of people going on the trip.
    Break the plan down by day, and provide a plan for each day of the trip. Make sure to fill each day with enough activities everybody busy for the entire day.
    Make sure to take into account the season of the trip, the weather, and special requests specified in the query.
    Be as specific as possible when it comes to names of places, activities, restaurants, venues, etc.
    """

# We use the align decorator to both test the function, as well as to align the model to expected output
@Monkey.align
def test_trip_planner():
    """We can test the function as normal using Pytest or Unittest"""
    pass


def get_url_params(url):
    params = {}
    if '?' in url:
        params = (url.split('?')[1]).split('&')
        params = {param.split('=')[0]: param.split('=')[1] for param in params}
    return params



# Out serverless function
class handler(BaseHTTPRequestHandler):

    # Gets a request from the client containing a statement and returns a response containing the evaluation
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        #key value pair of the query params
        params = get_url_params(self.path)
        if(not 'start_date' in params):
            payload = {
                'error': 'No start_date provided',
                'status': 400,
            }
            self.wfile.write(json.dumps(payload).encode())
            return

        if(not 'end_date' in params):
            payload = {
                'error': 'No end_date provided',
                'status': 400,
            }
            self.wfile.write(json.dumps(payload).encode())
            return

        if(not 'relationship' in params):
            payload = {
                'error': 'No relationship provided',
                'status': 400,
            }
            self.wfile.write(json.dumps(payload).encode())
            return

        if(not 'people_count' in params):
            payload = {
                'error': 'No people_count provided',
                'status': 400,
            }
            self.wfile.write(json.dumps(payload).encode())
            return

        if(not 'destination' in params):
            payload = {
                'error': 'No people_count provided',
                'status': 400,
            }
            self.wfile.write(json.dumps(payload).encode())
            return

        # validate that the parameters are correct
        try:
            start_date = DateString(date=params['start_date'])
            end_date = DateString(date=params['end_date'])
            relationship = RelationshipType(relationship=params['relationship'])
            people_count = params['people_count']
            destination = params['destination']
            requests = params['requests']

        except Exception as e:
            payload = {
                'error': str(e),
                'status': 400,
            }
            self.wfile.write(json.dumps(payload).encode())
            return

        print("Yay, I made it here")

        response = trip_planner(
            start_date=start_date,
            end_date=end_date,
            relationship=relationship,
            people_count=people_count,
            destination=destination,
            requests=requests
        )

        print("The response is", response)

        payload = {
            'data': response,
            'status': 200,
        }
        self.wfile.write(json.dumps(payload).encode())
        return