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
