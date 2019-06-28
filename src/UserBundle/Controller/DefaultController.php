<?php

namespace UserBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use UserBundle\Entity\User;
use UserBundle\Form\UserType;
use AdminBundle\Controller\DefaultController as D;
use Symfony\Component\HttpFoundation\Response;

class DefaultController extends D
{
    public function indexAction()
    {
        $em = $this->getDoctrine()->getManager();
        $users = $em->getRepository(User::class)->findAll();
        return $this->render('@User/Default/index.html.twig',array('users'=>$users) );

    }

    public function createAction(Request $request){
        $user = new User();

        $form = $this->createForm(UserType::class, $user);
        $form->handleRequest($request); /*creation d'une session pr stocker les valeurs de l'input*/
        if ($form->isValid()) {
            $user->setEnabled(true);
            $body =  "Bonjour ". $user->nom ." ".$user->getPrenom() .
            "<center>Bienvenue!!!</center><br>Bienvenue sur notre application. vous pouvez maintenant connectez chez  votre espace client en utilisiant les cordonnées cii-dessous :<br>"
                ."login :" . $user->getUsername() ."<br>"
                . "Mot de passe :" .$user->getPlainPassword().
            "<br><br><h5>Steedex support</h5>"
            ;
            //return  new Response($body);
            $em = $this->getDoctrine()->getManager();

            $em->persist($user);

            $message = (new \Swift_Message('Bienvenue chez Steedex'))
                ->setFrom('belhadjali.seif@gmail.com')
                ->setTo($user->getEmail())
                ->setBody($body
                );


            $this->get('mailer')->send($message);

            $em->flush();


            return $this->redirectToRoute("_list_users");

        }
        return $this->render('@User/Default/create.html.twig', array(
            'form' => $form->createView()
        ));



    }

    public function removeAction(Request $request,$id){
        $em=$this->getDoctrine()->getManager();
        $user=$em->getRepository("UserBundle:User")->find($id);
        if ($user!=null){
            $em->remove($user);
            $em->flush();
        }

        return $this->redirectToRoute("_list_users");
    }

    public function updateAction(Request $request,$id){

        $em=$this->getDoctrine()->getManager();
        $user=$em->getRepository("UserBundle:User")->find($id);
        $form=$this->createForm(UserType::class,$user);
        $form->handleRequest($request);

        if($form->isValid())
        {
            $em->persist($user);
            $em->flush();
            return $this->redirectToRoute('_list_users');
        }


        return $this->render("@User/Default/update.html.twig",array(
            'form'=>$form->createView()
        ));

    }


    public function sendToUserAction($id){

        $em = $this->getDoctrine()->getManager();
        $user = $em->getRepository(User::class)->findOneBy(['id' => $id]);
        $mail_adr = $user->getEmail();
        $login = $user->getUsername();
        $mdp = $user->getPassword();

        $message = (new \Swift_Message('Info Compte'))
            ->setFrom('belhadjali.seif@gmail.com')
            ->setTo($mail_adr)
            ->setBody(
                $login . " " . $mdp
            );
        $this->get('mailer')->send($message);
        return $this->redirectToRoute('_list_users');


    }


    public function sendToAdminAction($id){

        $em = $this->getDoctrine()->getManager();
        $user = $em->getRepository(User::class)->findOneBy(['id' => $id]);
        $mail_adr = $user->getEmail();
        $login = $user->getUsername();
        $mdp = $user->getPassword();

        $message = (new \Swift_Message('Info Compte - Steedex Admin'))
            ->setFrom('belhadjali.seif@gmail.com')
            ->setTo('belhadjali.seif@gmail.com')
            ->setTo($mail_adr)
            ->setBody(
                $login . " " . $mdp
            );
        $this->get('mailer')->send($message);
        return $this->redirectToRoute('_list_users');


    }


    public function testMailAction()
    {
        $message = (new \Swift_Message('Demande prête'))
            ->setFrom('belhadjali.seif@gmail.com')
            ->setTo('belhadjali.seif@gmail.com')
            ->setBody(
                "Votre demande est prête. Vous pouvez venir la récupérer"
            );
        $this->get('mailer')->send($message);
        return $this->redirectToRoute('_list_users');
    }



}
