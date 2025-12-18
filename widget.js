if (typeof memloadedPlanWidgetJS === 'undefined') {
    var memloadedPlanWidgetJS = true;
    var $jQNoConflict;
    bold_memberships_load_script = function (url, callback) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        document.getElementsByTagName('head')[0].appendChild(script);
        if(callback){
            script.onload = callback;
        }
    };

    bold_memberships_load_style = function(url) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        document.getElementsByTagName('head')[0].appendChild(link);
    };

    load_bootstrap_script = function() {
        bold_memberships_load_script('https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js',  loadWidget);
    };

    load_validator_script = function() {
        bold_memberships_load_script('https://ajax.aspnetcdn.com/ajax/jquery.validate/1.14.0/jquery.validate.min.js', load_bootstrap_script);
    };


    /**
     * Ticket: MEM-573
     * Removed the conditional loading if jquery exists. Force our version and then no conflict onto it.
     * https://api.jquery.com/jquery.noconflict/
     */
    bold_memberships_load_script ('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js', load_validator_script);

    bold_memberships_load_script('https://js.stripe.com/v3');

    var current_src = document.currentScript.src;
    var styles_src = current_src.replace('js/plan_multiwidget.js', 'css/stripe-form.css');

    bold_memberships_load_style(styles_src);

    if (!window.StripeCheckout) {
        bold_memberships_load_script('https://checkout.stripe.com/checkout.js');
    }

    function loadWidget() {
      $jQNoConflict = jQuery.noConflict(true);

      $jQNoConflict(document).ready(function () {

        var countriesWidget = [];

            createWidget = function (widgetData) {
                var planDescription = '',
                    planName = '';
                var domain  = typeof widgetData.domain === 'undefined' ? '' : widgetData.domain;
                var extraEmailField = '';

                if (widgetData.enableEmailVerification){
                    extraEmailField = '<div class="bold-form-group"><label id="lang_email_' + widgetData.plantag + '">Confirm Email</label><input type="text" class="email required" id="email_' + widgetData.plantag + '" name="n_email_validation" value=""></div>';
                }

                return contentHtml = $jQNoConflict('<form id="form_' + widgetData.plantag + '" data-plantag="' + widgetData.plantag + '" data-url="' + widgetData.url + '" data-hashwidget="' + widgetData.hashwidget + '" data-token="' + widgetData.token + '" data-idwidget="' + widgetData.idwidget + '" data-domain="' + domain + '">' +
                    '<h1 id="' + widgetData.plantag + '_name">' + planName + '</h1>' +
                    '<div id="' + widgetData.plantag + '_membership_container_desc" class="bold-mem-description"><meta charset="utf-8" /><span id="' + widgetData.plantag + '_desc" style="white-space: pre-wrap"> ' + planDescription + '</span></div>' +
                    '<div hidden id="' + widgetData.plantag + '_register_fields">' +
                    '<div class="bold-form-group"><label id="lang_first_name_' + widgetData.plantag + '">First Name</label><input type="text" class="first_name required" id="firstname_' + widgetData.plantag + '" name="n_firstname" value=""></div>' +
                    '<div class="bold-form-group"><label id="lang_last_name_' + widgetData.plantag + '">Last Name</label><input type="text" class="last_name required" id="lastname_' + widgetData.plantag + '" name="n_lastname" value=""></div>' +
                    '<div class="bold-form-group"><label id="lang_email_' + widgetData.plantag + '">Email</label><input type="text" class="email required" id="email_' + widgetData.plantag + '" name="n_email" value=""></div>' +
                    extraEmailField +
                    '</div>' +
                    '<div id="customFields_' + widgetData.plantag + '"></div>' +
                    '<div class="bold-form-group"><label id="lang_select_interval_' + widgetData.plantag + '">Select Interval</label>' +
                    '<select id="' + widgetData.plantag + '_membership_billing_option"></select>' +
                    '</div>' +
                    '<div class="bold-form-group subscriptionWidget"><label id="lang_address1_' + widgetData.plantag + '">Address Line 1</label><input type="text" id="address1_' + widgetData.plantag + '" class="address1 required subscriptionWidget" name="n_address1" value=""></div>' +
                    '<div class="bold-form-group subscriptionWidget"><label id="lang_address2_' + widgetData.plantag + '">Address Line 2</label><input type="text" id="address2_' + widgetData.plantag + '" class="address2 subscriptionWidget" name="n_address2" value=""></div>' +
                    '<div class="bold-form-group subscriptionWidget"><label id="lang_city_' + widgetData.plantag + '">City</label><input type="text" id="city_' + widgetData.plantag + '" class="city required subscriptionWidget" name="n_city" value=""></div>' +
                    '<div class="bold-form-group subscriptionWidget"><label id="lang_country_' + widgetData.plantag + '">Country</label><select class="country required subscriptionWidget" id="shippingCountryWidget_' + widgetData.plantag + '" name="n_country" onchange="updateProvinceWidget(\'' + widgetData.plantag + '\')"><option value="">--</option></select></div>' +
                    '<div class="bold-form-group subscriptionWidget"><label id="lang_province_' + widgetData.plantag + '">Province</label><select id="shippingProvinceWidget_' + widgetData.plantag + '" class="province required subscriptionWidget" name="n_province"><option value="">--</option></select></div>' +
                    '<div class="bold-form-group subscriptionWidget"><label id="lang_zip_' + widgetData.plantag + '">Zip</label><input type="text" id="zip_' + widgetData.plantag + '" class="zip required subscriptionWidget" name="n_zip" value=""></div>' +
                    '<div class="subscriptionWidget" id="subscriptionBoxInfo_' + widgetData.plantag + '"></div>' +
                    '<div id="bold-mem-email-manual-error" style="color:#cc0000;font-weight:bold;padding:10px 0px 10px 0px;"></div>' +
                    '<input type="button" data-gateway="stripe" data-gateway-id="2" style="display:none;margin:.25em;" class="btn boldmemsaveaccountwidget" id="' + widgetData.plantag + '_membership_button_stripe" value="Pay with Card">' +
                    '<input type="button" data-gateway="paypal" data-gateway-id="1" style="display:none;margin:.25em;" class="btn boldmemsaveaccountwidget" id="' + widgetData.plantag + '_membership_button" value="Pay with PayPal">' +
                    '<input type="button" data-gateway="free" data-gateway-id="0" style="display:none;margin:.25em;" class="btn boldmemsaveaccountwidget" id="' + widgetData.plantag + '_membership_button_free" value="Join For Free">' +
                    '</form>' +
                    '<div id="spinner_' + widgetData.plantag + '" style="display:none;"><span id="lang_loading_msg_' + widgetData.plantag + '">You will be redirected shortly...</span></div>');
            };

            updateWidgetData = function (widgetData) {
                var subscriptionBox = 0;
                var paypalEnabled = false;
                var stripeHandler = null;
                var stripe = null;
                var domain = typeof widgetData.domain === 'undefined' ? '' : widgetData.domain;
                var stripeSCAFlag = false;

                $jQNoConflict.post(widgetData.url + '/front_end/purchase/getfields', {
                    'id': widgetData.idwidget,
                    'hash': widgetData.hashwidget,
                    'csrf_bold_token': widgetData.token,
                    'domain': domain
                }, function (response) {
                    if(response === 'Application uninstalled') {
                        $jQNoConflict('form[data-plantag]').remove();
                        $jQNoConflict("body").append('<div id="bold-app-uninstalled" style="text-align:center;"><h4>Membership Uninstalled. Please contact store owner</h4></div>');
                        return;
                    }
                    if (typeof response.data.stripe_sca_flag !== 'undefined' && response.data.stripe_sca_flag) {
                        stripeSCAFlag = response.data.stripe_sca_flag;
                    }
                    if (response.data.plan.name) {
                        $jQNoConflict('#' + widgetData.plantag + '_name').text(response.data.plan.name);
                    }
                    if (response.data.plan.description) {
                        $jQNoConflict('#' + widgetData.plantag + '_desc').text(response.data.plan.description);
                    }
                    if (response.data.customFields.length > 0) {
                        $jQNoConflict.each(response.data.customFields, function (key, value) {
                            if (value['deprecated'] != 1) {
                                var el = $jQNoConflict('<div class="bold-form-group"><label>' + value['name'] + '</label></div>');
                                if (value['type'] == "1") {
                                    var formEl = $jQNoConflict('<textarea></textarea>');
                                } else {
                                    var formEl = $jQNoConflict('<input type="text" />');
                                }
                                formEl.attr('value_id', value['id']).attr('name', 'n_' + value['id']);
                                if (value['required'] == 1) {
                                    formEl.addClass('answer required');
                                } else {
                                    formEl.addClass('answer');
                                }
                                el.append(formEl);
                                $jQNoConflict('#customFields_' + widgetData.plantag).append(el);
                            }
                        });
                    }

                    if (response.data.billingOptions.length > 0) {
                        $jQNoConflict.each(response.data.billingOptions, function (key, value) {
                            var selEl = $jQNoConflict('<option>' + value['name'] + '</option>');
                            selEl.val(value['id']);
                            selEl.attr('data-price', value['price']);
                            $jQNoConflict('#' + widgetData.plantag + '_membership_billing_option').append(selEl);
                        });

                        $jQNoConflict('#' + widgetData.plantag + '_membership_billing_option').on('change', function () {
                            var price = $jQNoConflict(this).find(':selected').attr('data-price');
                            if (price == 0) {
                                $jQNoConflict('#' + widgetData.plantag + '_membership_button_free').show();
                                $jQNoConflict('#' + widgetData.plantag + '_membership_button_stripe').hide();
                                $jQNoConflict('#' + widgetData.plantag + '_membership_button').hide();
                            } else if (price < 50) {
                                $jQNoConflict('#' + widgetData.plantag + '_membership_button_free').hide();
                                $jQNoConflict('#' + widgetData.plantag + '_membership_button_stripe').hide();
                                showGatewayButton($jQNoConflict('#' + widgetData.plantag + '_membership_button'));
                            } else {
                                $jQNoConflict('#' + widgetData.plantag + '_membership_button_free').hide();
                                showGatewayButton($jQNoConflict('#' + widgetData.plantag + '_membership_button_stripe'));
                                showGatewayButton($jQNoConflict('#' + widgetData.plantag + '_membership_button'));
                            }
                        });
                    }

                    function showGatewayButton(button) {
                        if (button.attr('data-gateway-loaded') == 1) {
                            button.show();
                        } else {
                            button.hide();
                        }
                    }

                    if (response.data.plan.subscriptionBox == "1") {
                        subscriptionBox = 1;
                        $jQNoConflict('#form_' + widgetData.plantag + ' .subscriptionWidget').show();
                        $jQNoConflict('#subscriptionBoxInfo_' + widgetData.plantag).html(response.data.plan.subscriptionBoxInfo);
                        if (response.data.countries.length > 0) {
                            countriesWidget = response.data.countries;
                            $jQNoConflict.each(response.data.countries, function (key, value) {
                                $jQNoConflict('#shippingCountryWidget_' + widgetData.plantag).append('<option data-code="' + value['code'] + '" data-id="' + key + '" value="' + value['id'] + '">' + value['name'] + '</option>');
                            });
                        }
                    } else {
                        subscriptionBox = 0;
                        $jQNoConflict('#form_' + widgetData.plantag + ' .subscriptionWidget').hide();
                    }

                    if (typeof response.data.lang !== 'undefined') {
                        $jQNoConflict.each(response.data.lang, function (key, value) {
                            $jQNoConflict('#lang_' + key + '_' + widgetData.plantag).text(value != null ? value : '');
                        });
                        $jQNoConflict('#' + widgetData.plantag + '_membership_button_free').val(response.data.lang.join_btn_free);
                        $jQNoConflict('#' + widgetData.plantag + '_membership_button').val(response.data.lang.join_btn_paypal);
                        $jQNoConflict('#' + widgetData.plantag + '_membership_button_stripe').val(response.data.lang.join_btn_stripe);
                    }

                    if (response.data.stripe_pk) {
                        var stripeBtn = $jQNoConflict('#' + widgetData.plantag + '_membership_button_stripe');
                        stripeBtn.attr('data-name', response.data.plan.name);

                        if (stripeSCAFlag) {
                            stripe = Stripe(response.data.stripe_pk);
                        } else {
                            stripeHandler = StripeCheckout.configure({
                                panelLabel: 'Subscribe',
                                allowRememberMe: 'false',
                                key: response.data.stripe_pk
                            });
                        }

                        stripeBtn.attr('data-gateway-loaded', 1);
                        //stripeBtn.show();
                    }

                    if (response.data.paypal) {
                        paypalEnabled = true;
                        $jQNoConflict('#' + widgetData.plantag + '_membership_button').attr('data-gateway-loaded', 1);
                    }


                    $jQNoConflict('#' + widgetData.plantag + '_membership_billing_option').trigger('change');

                    $jQNoConflict('#' + widgetData.plantag + '_membership_container').show();
                });


                if (!$jQNoConflict('.bold_customer_id').length) {
                    $jQNoConflict('#' + widgetData.plantag + '_register_fields').removeAttr('hidden').show();
                }

                updateProvinceWidget = function (plantag) {
                    var cIndex = $jQNoConflict('#shippingCountryWidget_' + plantag + ' option:selected').data('id');
                    $jQNoConflict('#shippingProvinceWidget_' + plantag).html('<option>--</option>');
                    if (countriesWidget[cIndex].provinces.length > 0) {
                        countriesWidget[cIndex].provinces.forEach(function (prCurr, pIndex) {
                            $jQNoConflict('#shippingProvinceWidget_' + plantag).append('<option value="' + prCurr.code + '">' + prCurr.name + '</option>');
                        });
                    }
                };

                $jQNoConflict('#form_' + widgetData.plantag).on('click', '.boldmemsaveaccountwidget', function (e) {

                    if (widgetData.enableEmailVerification) {
                        var email = $jQNoConflict('#' + widgetData.plantag + '_membership_container').find('.email').val();
                        var confirmEmail = $jQNoConflict('#' + widgetData.plantag + '_membership_container').find('input[name="n_email_validation"]').val();
                        if (email != confirmEmail) {
                            alert('Emails do not match. Please try again');
                            return;
                        }
                    }

                    var gateway = $jQNoConflict(this).attr('data-gateway');
                    var gateway_id = $jQNoConflict(this).attr('data-gateway-id');

                    var form = $jQNoConflict(this).closest('form');

                    form.attr('data-gateway', gateway);
                    form.attr('data-gateway-id', gateway_id);

                    form.submit();
                });

                $jQNoConflict.validator.addMethod("OnlyWhitespaceNotAllowed", function(value, element) {
                    return value.trim().length > 0;
                }, "Must contain at least 1 character.");
                $jQNoConflict('#form_' + widgetData.plantag).validate({
                    errorClass: "my-error-class",
                    rules: {
                        n_firstname: "OnlyWhitespaceNotAllowed",
                        n_lastname: "OnlyWhitespaceNotAllowed"
                    },
                    submitHandler: function (form) {
                        var $form = $jQNoConflict(form);
                        var gateway = $form.attr('data-gateway');
                        var gateway_id = $form.attr('data-gateway-id');

                        var url = $form.attr('data-url');
                        var plantag = $form.attr('data-plantag');
                        var idwidget = $form.attr('data-idwidget');
                        var domain =  $form.attr('data-domain');

                        var customer_id = null;
                        var first_name = null;
                        var last_name = null;
                        var email = "";
                        var billing_id = $jQNoConflict('#' + plantag + '_membership_billing_option').val();
                        var plan_id = idwidget;
                        var questions = [];
                        var answers = [];
                        var address = null;

                        if ($jQNoConflict('.bold_customer_id').length) {
                            customer_id = $jQNoConflict('.bold_customer_id').text();
                            customer_id = parseInt(customer_id);
                        } else {
                            email = $jQNoConflict('#' + plantag + '_membership_container').find('.email').val();
                            first_name = $jQNoConflict('#' + plantag + '_membership_container').find('.first_name').val();
                            last_name = $jQNoConflict('#' + plantag + '_membership_container').find('.last_name').val();
                        }

                        $jQNoConflict('#' + plantag + '_membership_container').find('.answer').each(function () {
                            questions.push($jQNoConflict(this).attr('value_id'));
                            answers.push($jQNoConflict(this).val());
                        });

                        var postData = {
                            'gateway_data': {
                                id: gateway_id
                            },
                            'billing_id': billing_id,
                            'plan_id': plan_id,
                            'email': email,
                            'customer_id': customer_id,
                            'questions': questions,
                            'answers': answers,
                            'first_name': first_name,
                            'last_name': last_name,
                            'domain': domain
                        };

                        if (subscriptionBox == 1) {
                            postData.address = {
                                'address1': $jQNoConflict('#' + plantag + '_membership_container').find('.address1').val(),
                                'address2': $jQNoConflict('#' + plantag + '_membership_container').find('.address2').val(),
                                'province': $jQNoConflict('#' + plantag + '_membership_container #shippingProvinceWidget_' + plantag + ' option:selected').val(),
                                'country': $jQNoConflict('#' + plantag + '_membership_container #shippingCountryWidget_' + plantag + ' option:selected').val(),
                                'country_name': $jQNoConflict('#' + plantag + '_membership_container #shippingCountryWidget_' + plantag + ' option:selected').text(),
                                'country_code': $jQNoConflict('#' + plantag + '_membership_container #shippingCountryWidget_' + plantag + ' option:selected').data('code'),
                                'zip': $jQNoConflict('#' + plantag + '_membership_container').find('.zip').val(),
                                'city': $jQNoConflict('#' + plantag + '_membership_container').find('.city').val()
                            };
                        }

                        var postFn = function () {

                            $jQNoConflict('#spinner_' + plantag).show();

                            $jQNoConflict('#' + plantag + '_membership_button').prop("disabled", true);
                            $jQNoConflict('#' + plantag + '_membership_button_stripe').prop("disabled", true);
                            $jQNoConflict('#' + plantag + '_membership_button_free').prop("disabled", true);


                            if (postData.gateway_data.id == 0) {
                                $jQNoConflict('#' + plantag + '_membership_button_free').attr('value', 'Loading...');
                            } else if (postData.gateway_data.id == 1) {
                                $jQNoConflict('#' + plantag + '_membership_button').attr('value', 'Loading...');
                            } else if (postData.gateway_data.id == 2) {
                                $jQNoConflict('#' + plantag + '_membership_button_stripe').attr('value', 'Loading...');
                            }

                            $jQNoConflict('#' + plantag + '_membership_container #bold-mem-email-manual-error').text('');

                            $jQNoConflict.post(url + '/front_end/purchase', postData).then(function (response) {

                                if (response.error) {
                                    $jQNoConflict('#spinner_' + plantag).hide();
                                    $jQNoConflict('#' + plantag + '_membership_container #bold-mem-email-manual-error').text(response.error);
                                    $jQNoConflict('#' + plantag + '_membership_button').prop("disabled", false);
                                    $jQNoConflict('#' + plantag + '_membership_button_stripe').prop("disabled", false);
                                    $jQNoConflict('#' + plantag + '_membership_button_free').prop("disabled", false);

                                    if (postData.gateway_data.id == 0) {
                                        $jQNoConflict('#' + plantag + '_membership_button_free').attr('value', 'Join For Free');
                                    } else if (postData.gateway_data.id == 1) {
                                        $jQNoConflict('#' + plantag + '_membership_button').attr('value', 'Pay with PayPal');
                                    } else if (postData.gateway_data.id == 2) {
                                        $jQNoConflict('#' + plantag + '_membership_button_stripe').attr('value', 'Pay with Card');
                                    }

                                } else {
                                    top.location = response.redirect_url;
                                }
                            });
                        };

                        if (stripeSCAFlag) {
                            // Calls stripe.confirmCardSetup
                            // If the card requires authentication Stripe shows a pop-up modal to
                            // prompt the user to enter authentication details without leaving your page.
                            var payWithCard = function (stripe, card, clientSecret) {
                                loading(true);
                                stripe.confirmCardSetup(clientSecret, {
                                    payment_method: {
                                        card: card
                                    }
                                }).then(function (result) {
                                    if (result.error) {
                                        showError(result.error.message);
                                    } else {
                                        postData.gateway_data.stripe_token = result.setupIntent.payment_method;
                                        postFn();
                                    }
                                });
                            };

                            // Show the customer the error from Stripe if their card fails to charge
                            var showError = function (errorMsgText) {
                                loading(false);
                                document.querySelector("#stripe-card-error").classList.remove('hidden');
                                var errorMsg = document.querySelector("#stripe-card-error");
                                errorMsg.textContent = errorMsgText;
                            };

                            var loading = function (isLoading) {
                                if (isLoading) {
                                    // Disable the button and show a spinner
                                    document.querySelector("button").disabled = true;
                                    document.querySelector("#stripe-spinner").classList.remove("hidden");
                                    document.querySelector("#stripe-button-text").classList.add("hidden");
                                } else {
                                    document.querySelector("button").disabled = false;
                                    document.querySelector("#stripe-spinner").classList.add("hidden");
                                    document.querySelector("#stripe-button-text").classList.remove("hidden");
                                }
                            };
                        }


                        if (gateway == 'stripe') {
                            if (stripeSCAFlag) {
                                var planAmount = $jQNoConflict('#' + plantag + '_membership_billing_option option:selected').text();

                                var stripeOverlay = '<div id="stripe-overlay">' +
                                    '<form id="stripe-payment-form">\n' +
                                    '<div class="subscription-information">' +
                                    '<svg id="stripe-close" class="bv-icon__icon" viewBox="0 0 20 40"> <path classname="bv-icon__path" fill="grey" d="M11.5,10.3786797 L4.56066017,3.43933983 C3.97487373,2.85355339 3.02512627,2.85355339 2.43933983,3.43933983 C1.85355339,4.02512627 1.85355339,4.97487373 2.43933983,5.56066017 L9.37867966,12.5 L2.43933983,19.4393398 C1.85355339,20.0251263 1.85355339,20.9748737 2.43933983,21.5606602 C3.02512627,22.1464466 3.97487373,22.1464466 4.56066017,21.5606602 L11.5,14.6213203 L18.4393398,21.5606602 C19.0251263,22.1464466 19.9748737,22.1464466 20.5606602,21.5606602 C21.1464466,20.9748737 21.1464466,20.0251263 20.5606602,19.4393398 L13.6213203,12.5 L20.5606602,5.56066017 C21.1464466,4.97487373 21.1464466,4.02512627 20.5606602,3.43933983 C19.9748737,2.85355339 19.0251263,2.85355339 18.4393398,3.43933983 L11.5,10.3786797 Z"></path></svg>' +
                                    '<div id="stripe-plan-amount">' + planAmount + ' Subscription </div>' +
                                    '<div id="stripe-email">' + email + '</div>' +
                                    '</div>' +
                                    '<div class="payment-information">' +
                                    '<div id="stripe-card-number-element"><!--Stripe.js injects the Card Element--></div>\n' +
                                    '<div id="stripe-card-expiry-element"><!--Stripe.js injects the Card Element--></div>\n' +
                                    '<div id="stripe-card-cvc-element"><!--Stripe.js injects the Card Element--></div>\n' +
                                    '</div>' +
                                    '<div id="stripe-card-error" class="hidden" role="alert"></div>\n' +
                                    '<div class="action-information">' +
                                    '<button id="stripe-submit">\n' +
                                    '<div class="stripe-spinner hidden" id="stripe-spinner"></div>\n' +
                                    '<span id="stripe-button-text">Subscribe</span>\n' +
                                    '</button>\n' +
                                    '<p class="stripe-result-message hidden">\n' +
                                    'Payment succeeded, see the result in your\n' +
                                    '<a href="" target="_blank">Stripe dashboard.</a> Refresh the page to pay again.\n' +
                                    '</p>\n' +
                                    '</div>' +
                                    '</form>' +
                                    '</div>';

                                $jQNoConflict("body").append(stripeOverlay);

                                document.querySelector("#stripe-submit").disabled = true;

                                $jQNoConflict('#stripe-close').on('click', function (e) {
                                    $jQNoConflict('#stripe-overlay').detach();
                                });

                                $jQNoConflict.post(url + '/front_end/purchase/getSetupIntent', postData).then(function (data) {
                                    var stripeElements = stripe.elements();
                                    var style = {
                                        base: {
                                            color: "#32325d",
                                            fontFamily: 'Arial, sans-serif',
                                            fontSmoothing: "antialiased",
                                            fontSize: "16px",
                                            "::placeholder": {}
                                        },
                                        invalid: {
                                            fontFamily: 'Arial, sans-serif',
                                            color: "#fa755a",
                                        }
                                    };

                                    var cardNumberElement = stripeElements.create('cardNumber', {
                                        style: style
                                    });
                                    cardNumberElement.mount('#stripe-card-number-element');

                                    var cardExpiryElement = stripeElements.create('cardExpiry', {
                                        style: style
                                    });
                                    cardExpiryElement.mount('#stripe-card-expiry-element');

                                    var cardCvcElement = stripeElements.create('cardCvc', {
                                        style: style
                                    });
                                    cardCvcElement.mount('#stripe-card-cvc-element');

                                    $jQNoConflict("#stripe-overlay").removeClass("hidden");

                                    var removeErrors = function (event) {
                                        document.querySelector("#stripe-submit").disabled = event.empty;
                                        document.querySelector("#stripe-card-error").classList.add('hidden');
                                        document.querySelector("#stripe-card-error").textContent = event.error ? event.error.message : "";
                                    };

                                    cardNumberElement.addEventListener("change", function (event) {
                                        removeErrors(event);
                                    });

                                    cardExpiryElement.addEventListener("change", function (event) {
                                        removeErrors(event);
                                    });

                                    cardCvcElement.addEventListener("change", function (event) {
                                        removeErrors(event);
                                    });

                                    document.querySelector("#stripe-submit").disabled = false;

                                    var form = document.getElementById("stripe-payment-form");

                                    form.addEventListener("submit", function (event) {
                                        event.preventDefault();
                                        // Complete payment when the submit button is clicked
                                        payWithCard(stripe, cardNumberElement, data.clientSecret);
                                    });
                                });
                            } else {
                                stripeHandler.open({
                                    name: $jQNoConflict(this).attr('data-name'),
                                    email: email,
                                    description: $jQNoConflict('#' + plantag + '_membership_billing_option option:selected').text(),
                                    token: function (token) {
                                        postData.gateway_data.stripe_token = token.id;
                                        postFn();
                                    }
                                });
                            }
                        } else {
                            // Free and PayPal gateways
                            postFn();
                        }
                    }
                });
            };

            $jQNoConflict('.memberships_widget').each(function () {
                var memWidget = createWidget($jQNoConflict(this).data());
                $jQNoConflict('#' + $jQNoConflict(this).attr('data-plantag') + '_membership_container').append(memWidget);
                updateWidgetData($jQNoConflict(this).data());
            });

        });
    }
}