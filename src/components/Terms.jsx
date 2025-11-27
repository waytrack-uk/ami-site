import React from "react";

const Terms = () => {
  return (
    <div className="min-h-screen w-full pt-8 md:pt-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* EULA Header */}
        <h1 className="text-4xl md:text-5xl mb-6 text-gray-900">END USER LICENCE AGREEMENT</h1>
        <p className="text-lg text-gray-700 mb-12">Last updated November 26, 2025</p>

        {/* Introduction */}
        <section className="mb-16">
          <p className="text-lg text-gray-800 mb-6">
            Archive is licensed to You (End-User) by Waytrack LTD, located and registered at Flat 176, Clarence Gate Gardens, Glentworth St, London, NW1 6AR, England ('Licensor'), for use only under the terms of this Licence Agreement.
          </p>
          <p className="text-lg text-gray-800 mb-6">
            By downloading the Licensed Application from Apple's software distribution platform ('App Store'), and any update thereto (as permitted by this Licence Agreement), You indicate that You agree to be bound by all of the terms and conditions of this Licence Agreement, and that You accept this Licence Agreement. App Store is referred to in this Licence Agreement as 'Services'.
          </p>
          <p className="text-lg text-gray-800 mb-6">
            The parties of this Licence Agreement acknowledge that the Services are not a Party to this Licence Agreement and are not bound by any provisions or obligations with regard to the Licensed Application, such as warranty, liability, maintenance and support thereof. Waytrack LTD, not the Services, is solely responsible for the Licensed Application and the content thereof.
          </p>
          <p className="text-lg text-gray-800 mb-6">
            This Licence Agreement may not provide for usage rules for the Licensed Application that are in conflict with the latest Apple Media Services Terms and Conditions ('Usage Rules'). Waytrack LTD acknowledges that it had the opportunity to review the Usage Rules and this Licence Agreement is not conflicting with them.
          </p>
        </section>

        {/* Table of Contents */}
        <section className="mb-16">
          <h2 className="text-3xl mb-6 text-gray-900">TABLE OF CONTENTS</h2>
          <ol className="space-y-2 text-lg text-gray-800">
            <li className="hover:text-gray-600 transition-colors">
              <a href="#application">1. THE APPLICATION</a>
            </li>
            <li className="hover:text-gray-600 transition-colors">
              <a href="#scope">2. SCOPE OF LICENCE</a>
            </li>
            <li className="hover:text-gray-600 transition-colors">
              <a href="#requirements">3. TECHNICAL REQUIREMENTS</a>
            </li>
            <li className="hover:text-gray-600 transition-colors">
              <a href="#maintenance">4. MAINTENANCE AND SUPPORT</a>
            </li>
            <li className="hover:text-gray-600 transition-colors">
              <a href="#data">5. USE OF DATA</a>
            </li>
            <li className="hover:text-gray-600 transition-colors">
              <a href="#contributions">6. USER-GENERATED CONTRIBUTIONS</a>
            </li>
            <li className="hover:text-gray-600 transition-colors">
              <a href="#contribution-licence">7. CONTRIBUTION LICENCE</a>
            </li>
            <li className="hover:text-gray-600 transition-colors">
              <a href="#liability">8. LIABILITY</a>
            </li>
            <li className="hover:text-gray-600 transition-colors">
              <a href="#warranty">9. WARRANTY</a>
            </li>
            <li className="hover:text-gray-600 transition-colors">
              <a href="#claims">10. PRODUCT CLAIMS</a>
            </li>
            <li className="hover:text-gray-600 transition-colors">
              <a href="#compliance">11. LEGAL COMPLIANCE</a>
            </li>
            <li className="hover:text-gray-600 transition-colors">
              <a href="#contact">12. CONTACT INFORMATION</a>
            </li>
          </ol>
        </section>

        {/* The Application Section */}
        <section id="application" className="mb-16">
          <h2 className="text-3xl mb-6 text-gray-900">1. THE APPLICATION</h2>
          <div className="space-y-6 text-lg text-gray-800">
            <p>Archive ('Licensed Application') is a piece of software created to Help users connect, record, and discover tv, music, podcasts, and books with friends — and customised for iOS mobile devices ('Devices'). It is used to Record and share the tv, music, podcasts, and books that a user has watched, listened to and read.</p>
            <p>Furthermore, it is used to Write opinions on the tv, music, podcasts, and books that a user watches, listens to, or reads.</p>
          </div>
        </section>

        {/* Scope of License Section */}
        <section id="scope" className="mb-16">
          <h2 className="text-3xl mb-6 text-gray-900">2. SCOPE OF LICENCE</h2>
          <div className="space-y-6 text-lg text-gray-800">
            <p>2.1 You are given a non-transferable, non-exclusive, non-sublicensable licence to install and use the Licensed Application on any Devices that You (End-User) own or control and as permitted by the Usage Rules, with the exception that such Licensed Application may be accessed and used by other accounts associated with You (End-User, The Purchaser) via Family Sharing or volume purchasing.</p>
            
            <p>2.2 This licence will also govern any updates of the Licensed Application provided by Licensor that replace, repair, and/or supplement the first Licensed Application, unless a separate licence is provided for such update, in which case the terms of that new licence will govern.</p>
            
            <p>2.3 You may not share or make the Licensed Application available to third parties (unless to the degree allowed by the Usage Rules, and with Waytrack LTD's prior written consent), sell, rent, lend, lease or otherwise redistribute the Licensed Application.</p>
            
            <p>2.4 You may not reverse engineer, translate, disassemble, integrate, decompile, remove, modify, combine, create derivative works or updates of, adapt, or attempt to derive the source code of the Licensed Application, or any part thereof (except with Waytrack LTD's prior written consent).</p>
            
            <p>2.5 You may not copy (excluding when expressly authorised by this licence and the Usage Rules) or alter the Licensed Application or portions thereof. You may create and store copies only on devices that You own or control for backup keeping under the terms of this licence, the Usage Rules, and any other terms and conditions that apply to the device or software used. You may not remove any intellectual property notices. You acknowledge that no unauthorised third parties may gain access to these copies at any time. If you sell your Devices to a third party, you must remove the Licensed Application from the Devices before doing so.</p>
            
            <p>2.6 Violations of the obligations mentioned above, as well as the attempt of such infringement, may be subject to prosecution and damages.</p>
            
            <p>2.7 Licensor reserves the right to modify the terms and conditions of licensing.</p>
            
            <p>2.8 Nothing in this licence should be interpreted to restrict third-party terms. When using the Licensed Application, You must ensure that You comply with applicable third-party terms and conditions.</p>
          </div>
        </section>

        {/* Technical Requirements Section */}
        <section id="requirements" className="mb-16">
          <h2 className="text-3xl mb-6 text-gray-900">3. TECHNICAL REQUIREMENTS</h2>
          <div className="space-y-6 text-lg text-gray-800">
            <p>3.1 The Licensed Application requires a firmware version 17.5 or higher. Licensor recommends using the latest version of the firmware.</p>
            
            <p>3.2 Licensor attempts to keep the Licensed Application updated so that it complies with modified/new versions of the firmware and new hardware. You are not granted rights to claim such an update.</p>
            
            <p>3.3 You acknowledge that it is Your responsibility to confirm and determine that the app end-user device on which You intend to use the Licensed Application satisfies the technical specifications mentioned above.</p>
            
            <p>3.4 Licensor reserves the right to modify the technical specifications as it sees appropriate at any time.</p>
          </div>
        </section>

        {/* Maintenance and Support Section */}
        <section id="maintenance" className="mb-16">
          <h2 className="text-3xl mb-6 text-gray-900">4. MAINTENANCE AND SUPPORT</h2>
          <div className="space-y-6 text-lg text-gray-800">
            <p>4.1 The Licensor is solely responsible for providing any maintenance and support services for this Licensed Application. You can reach the Licensor at the email address listed in the App Store Overview for this Licensed Application.</p>
            
            <p>4.2 Waytrack LTD and the End-User acknowledge that the Services have no obligation whatsoever to furnish any maintenance and support services with respect to the Licensed Application.</p>
          </div>
        </section>

        {/* Use of Data Section */}
        <section id="data" className="mb-16">
          <h2 className="text-3xl mb-6 text-gray-900">5. USE OF DATA</h2>
          <div className="space-y-6 text-lg text-gray-800">
            <p>You acknowledge that Licensor will be able to access and adjust Your downloaded Licensed Application content and Your personal information, and that Licensor's use of such material and information is subject to Your legal agreements with Licensor and Licensor's privacy policy: <a href="https://archive.mobi/privacy/" className="text-blue-600 hover:text-blue-800 underline">https://archive.mobi/privacy/</a>.</p>
            
            <p>You acknowledge that the Licensor may periodically collect and use technical data and related information about your device, system, and application software, and peripherals, offer product support, facilitate the software updates, and for purposes of providing other services to you (if any) related to the Licensed Application. Licensor may also use this information to improve its products or to provide services or technologies to you, as long as it is in a form that does not personally identify you.</p>
          </div>
        </section>

        {/* User-Generated Contributions Section */}
        <section id="contributions" className="mb-16">
          <h2 className="text-3xl mb-6 text-gray-900">6. USER-GENERATED CONTRIBUTIONS</h2>
          <div className="space-y-6 text-lg text-gray-800">
            <p>The Licensed Application may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or in the Licensed Application, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, 'Contributions').</p>
            
            <p className="font-medium mt-8">When you create or make available any Contributions, you thereby represent and warrant that:</p>
            
            <ol className="list-decimal pl-6 space-y-4 mt-4">
              <li>The creation, distribution, transmission, public display, or performance, and the accessing, downloading, or copying of your Contributions do not and will not infringe the proprietary rights, including but not limited to the copyright, patent, trademark, trade secret, or moral rights of any third party.</li>
              <li>You are the creator and owner of or have the necessary licences, rights, consents, releases, and permissions to use and to authorise us, the Licensed Application, and other users of the Licensed Application to use your Contributions in any manner contemplated by the Licensed Application and this Licence Agreement.</li>
              <li>You have the written consent, release, and/or permission of each and every identifiable individual person in your Contributions to use the name or likeness or each and every such identifiable individual person to enable inclusion and use of your Contributions in any manner contemplated by the Licensed Application and this Licence Agreement.</li>
              <li>Your Contributions are not false, inaccurate, or misleading.</li>
              <li>Your Contributions are not unsolicited or unauthorised advertising, promotional materials, pyramid schemes, chain letters, spam, mass mailings, or other forms of solicitation.</li>
              <li>Your Contributions are not obscene, lewd, lascivious, filthy, violent, harassing, libellous, slanderous, or otherwise objectionable (as determined by us).</li>
              <li>Your Contributions do not ridicule, mock, disparage, intimidate, or abuse anyone.</li>
              <li>Your Contributions are not used to harass or threaten (in the legal sense of those terms) any other person and to promote violence against a specific person or class of people.</li>
              <li>Your Contributions do not violate any applicable law, regulation, or rule.</li>
              <li>Your Contributions do not violate the privacy or publicity rights of any third party.</li>
              <li>Your Contributions do not violate any applicable law concerning child pornography, or otherwise intended to protect the health or well-being of minors.</li>
              <li>Your Contributions do not include any offensive comments that are connected to race, national origin, gender, sexual preference, or physical handicap.</li>
              <li>Your Contributions do not otherwise violate, or link to material that violates, any provision of this Licence Agreement, or any applicable law or regulation.</li>
            </ol>
          </div>
        </section>
        
        {/* Contribution License Section */}
        <section id="contribution-licence" className="mb-16">
          <h2 className="text-3xl mb-6 text-gray-900">7. CONTRIBUTION LICENCE</h2>
          <div className="space-y-6 text-lg text-gray-800">
            <p>By posting your Contributions to any part of the Licensed Application or making Contributions accessible to the Licensed Application by linking your account from the Licensed Application to any of your social networking accounts, you automatically grant, and you represent and warrant that you have the right to grant, to us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right, and licence to host, use copy, reproduce, disclose, sell, resell, publish, broadcast, retitle, archive, store, cache, publicly display, reformat, translate, transmit, excerpt (in whole or in part), and distribute such Contributions (including, without limitation, your image and voice) for any purpose, commercial advertising, or otherwise, and to prepare derivative works of, or incorporate in other works, such Contributions, and grant and authorise sublicences of the foregoing.</p>

            <p>This licence will apply to any form, media, or technology now known or hereafter developed, and includes our use of your name, company name, and franchise name, as applicable, and any of the trademarks, service marks, trade names, logos, and personal and commercial images you provide. You waive all moral rights in your Contributions, and you warrant that moral rights have not otherwise been asserted in your Contributions.</p>

            <p>We do not assert any ownership over your Contributions. You retain full ownership of all of your Contributions and any intellectual property rights or other proprietary rights associated with your Contributions. We are not liable for any statements or representations in your Contributions provided by you in any area in the Licensed Application. You are solely responsible for your Contributions to the Licensed Application and you expressly agree to exonerate us from any and all responsibility and to refrain from any legal action against us regarding your Contributions.</p>

            <p>We have the right, in our sole and absolute discretion, (1) to edit, redact, or otherwise change any Contributions; (2) to recategorise any Contributions to place them in more appropriate locations in the Licensed Application; and (3) to prescreen or delete any Contributions at any time and for any reason, without notice. We have no obligation to monitor your Contributions.</p>
          </div>
        </section>

        {/* Liability Section */}
        <section id="liability" className="mb-16">
          <h2 className="text-3xl mb-6 text-gray-900">8. LIABILITY</h2>
          <div className="space-y-6 text-lg text-gray-800">
            <p>8.1 Licensor's responsibility in the case of violation of obligations and tort shall be limited to intent and gross negligence. Only in case of a breach of essential contractual duties (cardinal obligations), Licensor shall also be liable in case of slight negligence. In any case, liability shall be limited to the foreseeable, contractually typical damages. The limitation mentioned above does not apply to injuries to life, limb, or health.</p>

            <p>8.2 Licensor takes no accountability or responsibility for any damages caused due to a breach of duties according to Section 2 of this Licence Agreement. To avoid data loss, You are required to make use of backup functions of the Licensed Application to the extent allowed by applicable third-party terms and conditions of use. You are aware that in case of alterations or manipulations of the Licensed Application, You will not have access to the Licensed Application.</p>
          </div>
        </section>

        {/* Warranty Section */}
        <section id="warranty" className="mb-16">
          <h2 className="text-3xl mb-6 text-gray-900">9. WARRANTY</h2>
          <div className="space-y-6 text-lg text-gray-800">
            <p>9.1 Licensor warrants that the Licensed Application is free of spyware, trojan horses, viruses, or any other malware at the time of Your download. Licensor warrants that the Licensed Application works as described in the user documentation.</p>

            <p>9.2 No warranty is provided for the Licensed Application that is not executable on the device, that has been unauthorisedly modified, handled inappropriately or culpably, combined or installed with inappropriate hardware or software, used with inappropriate accessories, regardless if by Yourself or by third parties, or if there are any other reasons outside of Waytrack LTD's sphere of influence that affect the executability of the Licensed Application.</p>

            <p>9.3 You are required to inspect the Licensed Application immediately after installing it and notify Waytrack LTD about issues discovered without delay by email provided in Contact Information. The defect report will be taken into consideration and further investigated if it has been emailed within a period of ninety (90) days after discovery.</p>

            <p>9.4 If we confirm that the Licensed Application is defective, Waytrack LTD reserves a choice to remedy the situation either by means of solving the defect or substitute delivery.</p>

            <p>9.5 In the event of any failure of the Licensed Application to conform to any applicable warranty, You may notify the Services Store Operator, and Your Licensed Application purchase price will be refunded to You. To the maximum extent permitted by applicable law, the Services Store Operator will have no other warranty obligation whatsoever with respect to the Licensed Application, and any other losses, claims, damages, liabilities, expenses, and costs attributable to any negligence to adhere to any warranty.</p>

            <p>9.6 If the user is an entrepreneur, any claim based on faults expires after a statutory period of limitation amounting to twelve (12) months after the Licensed Application was made available to the user. The statutory periods of limitation given by law apply for users who are consumers.</p>
          </div>
        </section>

        {/* Product Claims Section */}
        <section id="claims" className="mb-16">
          <h2 className="text-3xl mb-6 text-gray-900">10. PRODUCT CLAIMS</h2>
          <div className="space-y-6 text-lg text-gray-800">
            <p>Waytrack LTD and the End-User acknowledge that Waytrack LTD, and not the Services, is responsible for addressing any claims of the End-User or any third party relating to the Licensed Application or the End-User's possession and/or use of that Licensed Application, including, but not limited to:</p>

            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Product liability claims;</li>
              <li>Any claim that the Licensed Application fails to conform to any applicable legal or regulatory requirement; and</li>
              <li>Claims arising under consumer protection, privacy, or similar legislation, including in connection with Your Licensed Application's use of the HealthKit and HomeKit.</li>
            </ul>
          </div>
        </section>

        {/* Legal Compliance Section */}
        <section id="compliance" className="mb-16">
          <h2 className="text-3xl mb-6 text-gray-900">11. LEGAL COMPLIANCE</h2>
          <div className="space-y-6 text-lg text-gray-800">
            <p>You represent and warrant that You are not located in a country that is subject to a US Government embargo, or that has been designated by the US Government as a 'terrorist supporting' country; and that You are not listed on any US Government list of prohibited or restricted parties.</p>
          </div>
        </section>

        {/* Contact Information Section */}
        <section id="contact" className="mb-16">
          <h2 className="text-3xl mb-6 text-gray-900">12. CONTACT INFORMATION</h2>
          <div className="space-y-6 text-lg text-gray-800">
            <p>For general inquiries, complaints, questions or claims concerning the Licensed Application, please contact:</p>

            <div className="pl-6 border-l-2 border-gray-300 my-4">
              <p>Alexander Bloom</p>
              <p>Flat 176, Clarence Gate Gardens</p>
              <p>Glentworth St, London</p>
              <p>NW1 6AR</p>
              <p>England</p>
              <p>alexanderbloom@waytrack.co.uk</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Terms;