// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
// limitations under the License.

(function(scope) {

  // consume* functions return a 2 value array of [parsed-data, '' or not-yet consumed input]

  // Regex should be anchored with /^
  function consumeToken(regex, string) {
    var result = regex.exec(string);
    if (result) {
      result = regex.ignoreCase ? result[0].toLowerCase() : result[0];
      return [result, string.substr(result.length)];
    }
  }

  function consumeTrimmed(consumer, string) {
    string = string.replace(/^\s*/, '');
    var result = consumer(string);
    if (result) {
      return [result[0], result[1].replace(/^\s*/, '')];
    }
  }

  function consumeList(consumer, separator, string) {
    consumer = consumeTrimmed.bind(null, consumer);
    var list = [];
    while (true) {
      var result = consumer(string);
      if (!result) {
        return [list, string];
      }
      list.push(result[0]);
      string = result[1];
      result = consumeToken(separator, string);
      if (!result || result[1] == '') {
        return [list, string];
      }
      string = result[1];
    }
  }

  // Consumes a token or expression with balanced parentheses
  function consumeParenthesised(parser, string) {
    var nesting = 0;
    for (var n = 0; n < string.length; n++) {
      if (/\s|,/.test(string[n]) && nesting == 0) {
        break;
      } else if (string[n] == '(') {
        nesting++;
      } else if (string[n] == ')') {
        nesting--;
        if (nesting <= 0) {
          n++;
          break;
        }
      }
    }
    var parsed = parser(string.substr(0, n));
    return parsed ? [parsed, string.substr(n)] : undefined;
  }

  function mergeNestedRepeated(nestedMerge, separator, left, right) {
    var matchingLeft = [];
    var matchingRight = [];
    var reconsititution = [];
    for (var i = 0; i < left.length; i++) {
      var thing = nestedMerge(left[i], right[i]);
      if (!thing) {
        return;
      }
      matchingLeft.push(thing[0]);
      matchingRight.push(thing[1]);
      reconsititution.push(thing[2]);
    }
    return [matchingLeft, matchingRight, function(positions) {
      return positions.map(function(position, i) {
        return reconsititution[i](position);
      }).join(separator);
    }];
  }

  scope.consumeToken = consumeToken;
  scope.consumeTrimmed = consumeTrimmed;
  scope.consumeList = consumeList;
  scope.consumeParenthesised = consumeParenthesised;
  scope.mergeNestedRepeated = mergeNestedRepeated;

})(webAnimationsMinifill);
