<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class DefaultController extends Controller
{

    /**
     * @Route("/", name="homepage")
     */
    public function indexAction(Request $request)
    {
        // replace this example code with whatever you need
        return $this->render('default/index.html.twig', [
            'base_dir' => realpath($this->getParameter('kernel.project_dir')).DIRECTORY_SEPARATOR,
        ]);
    }




    /**
     * @Route("/api/login_check", name="login")
     * @return JsonResponse
     */
    public function loginAction(Request $request)
    {
        // replace this example code with whatever you need
        return $this->render('default/index.html.twig', [
            'base_dir' => realpath($this->getParameter('kernel.project_dir')).DIRECTORY_SEPARATOR,
        ]);

        $user = $this->getUser();
        return $this->json(array(
            'username' => $user->getUsername(),
            'roles' => $user->getRoles(),
        ));
    }


    


    /**
     * @Route("/getdevis", name="getdevis")
     */
    public function getDevisAction(Request $request)
    {
        $name = $request->get('name');
        $phone = $request->get('phone');
        $messageDesc = $request->get('message');


        $message = (new \Swift_Message('Contact - Steedex Admin'))
            ->setFrom("user@steedex.tn")
            ->setTo('belhadjali.seif@gmail.com')
            ->setBody("<b>Nom&Prenom: </b>" .$name. "<br><b>Télephone: </b>" . $phone . "<br><b>Message: </b>" . $messageDesc);
        $message->setContentType("text/html");

        $this->get('mailer')->send($message);



  if(!$this->captchaverify($request->get('g-recaptcha-response'))){
                 
            $this->addFlash(
                'error',
                'Captcha Require'
              );             

}

        return new Response("Devis envoyee avec success");

    }


    function captchaverify($recaptcha){
            $url = "https://www.google.com/recaptcha/api/siteverify";
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_HEADER, 0);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE); 
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, array(
                "secret"=>"6Lc2uL8UAAAAALTugfCyvzZ-gtkfAHNOvStbtRYt","response"=>$recaptcha));
            $response = curl_exec($ch);
            curl_close($ch);
            $data = json_decode($response);     
        
        return $data->success;        
}

    /**
     * @Route("/confidentialite", name="confidentialite")
     */
    public function confidentialiteAction()
    {
        return $this->render('@Admin/Default/confidentialite.html.twig');

    }

    /**
     * @Route("/spy", name="spy")
     */
    public function spyAction()
    {
        return $this->render('default/partials/sections.html.twig');

    }

    /**
     * @Route("/spy2", name="spy2")
     */
    public function spy2Action()
    {
        return $this->render('default/partials/spy2.html.twig');

    }



    /**
     * @Route("/getQuote", name="quote")
     */
    public function quoteAction(Request $request)
    {
        $name = $request->get("name");
        $subject = $request->get("subject");
        $email = $request->get("email");
        $company = $request->get("company");
        $tel = $request->get("phone");
        $message = $request->get("message");


        $message = (new \Swift_Message('Contact - Steedex Admin'))
            ->setFrom($email)
            ->setTo('belhadjali.seif@gmail.com')
            ->setBody(
                "<b>name :</b> " . $name . "<br> <b>Sujet :</b>" . $subject . "<br><b>Telephone :</b>" . $tel . "<br> <b>Societe :</b>" . $company . "<br><b>Message :</b>" . $message
            );
        $message->setContentType("text/html");

        $this->get('mailer')->send($message);


        return new Response("Formulaire envoyee avec success");
    }




    public function nbUsersAction()
    {
        $em=$this->getDoctrine()->getManager();
        $nb_users = $em->getRepository("UserBundle:User")->countAllUsers();
        return new Response($nb_users);
    }


    public function countUnreadMessagesAction()
    {
        $em=$this->getDoctrine()->getManager();
        $nb_unread_msgs = $em->getRepository("DemandeBundle:Demande")->countUnreadCol();
        return new Response($nb_unread_msgs);
    }

}
