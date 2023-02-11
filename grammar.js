/* eslint-disable arrow-parens */
/* eslint-disable camelcase */
/* eslint-disable-next-line spaced-comment */
/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: 'Jenkinsfile',

  rules: {
    pipeline: $ => seq(
      'pipeline',
      '{',
      repeat($._pipeline_block),
      '}',
    ),

    _pipeline_block: $ => choice(
      $.agent,
      $.environment,
      $.options,
      $.parameters,
      $.post,
      $.stages,
      $.tools,
      $.triggers,
    ),

    agent: $ =>
      seq(
        'agent',
        choice(
          'any',
          'none',
          seq('{', choice($.label, $.node, $.docker, $.dockerfile), '}'),
        ),
      ),

    label: $ => seq('label', $.string),

    node: $ => seq('node', '{', repeat($.node_field), '}'),

    docker: $ => seq('docker', '{', repeat($.docker_field), '}'),
    docker_field: $ => choice(
      seq('image', $.string),
      $.label,
      seq('registryUrl', $.string),
      seq('registryCredentialsId', $.string),
    ),

    dockerfile: $ => seq('dockerfile', '{', repeat($.dockerfile_field), '}'),
    dockerfile_field: $ => choice(
      seq('filename', $.string),
      seq('dir', $.string),
      $.label,
      seq('additionalBuildArgs', $.string),
      seq('args', $.string),
      seq('registryUrl', $.string),
      seq('registryCredentialsId', $.string),
    ),

    environment: $ => seq(
      'environment',
      '{',
      repeat($.environment_field),
      '}',
    ),
    environment_field: $ => seq($.identifier, '=', $.value),

    options: $ => seq(
      'options',
      '{',
      repeat($.options_field),
      '}',
    ),
    options_field: $ => choice(
      seq('buildDiscarder', $.build_discarder),
      seq('checkoutToSubdirectory', '(', $.boolean, ')'),
      seq('disableConcurrentBuilds', '()'),
      seq('disableResume', '()'),
      seq('newContainerPerStage', '()'),
      seq('overrideIndexTriggers', '(', $.boolean, ')'),
      seq('preserveStashes', '(', optional($.key_value_pair), ')'),
      seq('quietPeriod', '(', $.number, ')'),
      seq('retry', '(', $.number, ')'),
      seq('skipDefaultCheckout', '()'),
      seq('skipStagesAfterUnstable', '()'),
      seq('timeout', '(', $.timeout, ')'),
      seq('timestamps', '()'),
    ),
    build_discarder: $ => choice(
      seq('logRotator', '(', repeat($.log_rotator_field), ')'),
    ),
    log_rotator_field: $ => choice(
      seq('numToKeep', '(', $.number, ')'),
      seq('daysToKeep', '(', $.number, ')'),
      seq('artifactDaysToKeep', '(', $.number, ')'),
      seq('artifactNumToKeep', '(', $.number, ')'),
    ),
    timeout: $ => choice(
      seq('time', '(', $.number, ')'),
      seq('unit', '(', $.string, ')'),
    ),

    parameters: $ => seq(
      'parameters',
      '{',
      repeat($.parameters_field),
      '}',
    ),
    parameters_field: $ => choice(
      seq('string', '(', repeat1($.key_value_pair), ')'),
      seq('text', '(', repeat1($.key_value_pair), ')'),
      seq('bool', '(', repeat1($.key_value_pair), ')'),
      seq('choice', '(', repeat1($.key_value_pair), ')'),
      seq('password', '(', repeat1($.key_value_pair), ')'),
    ),

    post: $ => seq('post', $.post_body),
    post_body: $ => seq('{', repeat($.post_field), '}'),
    post_field: $ => choice(
      seq('always', $.step),
      seq('changed', $.step),
      seq('fixed', $.step),
      seq('regression', $.step),
      seq('aborted', $.step),
      seq('failure', $.step),
      seq('success', $.step),
      seq('unstable', $.step),
      seq('unsuccessful', $.step),
      seq('cleanup', $.step),
    ),

    stages: $ => seq('stages', $.stages_body),
    stages_body: $ => seq('{', repeat($.stage), '}'),
    stage: $ =>
      seq('stage', '(', alias($.string, $.stage_name), ')', $.stage_body),
    stage_body: $ => seq('{', repeat($.stage_field), '}'),
    stage_field: $ => choice(
      $.agent,
      $.environment,
      $.if,
	  $.try,
      $.options,
      seq('post', $.post_body),
      seq('steps', $.steps),
      seq('when', $.when),
      seq('parallel', $.parallel),
    ),

    when: $ => seq('when', $.when_body),
    when_body: $ => seq('{', repeat($.when_field), '}'),
    when_field: $ => choice(
      seq('branch', $.string),
      seq('buildingTag', '()'),
      seq('changelog', $.regex_string),
      seq('changeset', choice($.string, repeat1($.key_value_pair))),
      seq('changeRequest', choice('()', repeat1($.key_value_pair))),
      seq('environment', repeat1($.key_value_pair)),
      seq('equals', repeat1($.key_value_pair)),
      seq('expression', $.expression),
      seq('tag', $.string),
      seq('not', $.when_body),
      seq('allOf', $.when_body),
      seq('anyOf', $.when_body),
      seq('triggeredBy', choice($.string, repeat1($.key_value_pair))),
    ),
    expression: $ => seq('{', $.expression_body, '}'),
    expression_body: $ => seq('return', $.identifier, repeat(seq('.', $.identifier))),

    steps: $ => seq('steps', '{', repeat($.step), '}'),
    step: $ => choice(
      seq('script', $.script),
    ),

    key_value_pair: $ => seq($.identifier, ':', $.value),

    boolean: _ => choice('true', 'false'),

    number: _ => /[0-9]+/,
  },
});
